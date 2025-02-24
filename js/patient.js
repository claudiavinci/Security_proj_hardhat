import { getWalletAddress } from "./connectionHandler.js";
import PrescriptionsContract from "./contracts.js";

const web3 = new Web3(window.ethereum);
const prescrContract = new web3.eth.Contract(PrescriptionsContract.abi, PrescriptionsContract.address); 

document.addEventListener("DOMContentLoaded", async () => {
    const patient = await getWalletAddress();
    const prescriptions = await getPatientPrescriptions(patient);
    const wrapCont = document.getElementById("wrap-container");
    
    if(Object.keys(prescriptions).length == 0){
        wrapCont.innerHTML = "Non ci sono prescrizioni disponibili.";
    }else{
        // visualizzare le ricette sulla schermata principale
        fillPrescriptionCards(prescriptions, wrapCont);

        // visualizzare, decifrare quando si seleziona la ricetta specifica
        wrapCont.addEventListener("click", async (event) => {
            const btn = event.target;
            const wrapElem = btn.closest(".wrap-elem");
            const prescrID = wrapElem.querySelector("#prescrID").innerHTML;
            const fields = btn.parentElement.previousElementSibling;
            const overlayDate = wrapCont.querySelector("#overlay-date");

            // controllo di aver premuto un bottone per evitare eventi indesiderati
            if (btn.tagName === "BUTTON"){
                if(wrapElem.querySelector("#prescr").innerHTML.trim() == ''){
                    // if prescription is blurred (not already decrypted)
                    const decrypted = await decryptPrescription(prescriptions, prescrID, patient);
                    const name = decrypted.name.split('/');

                    wrapElem.querySelector("#name").innerHTML = name[0] + ' ' + name[1];
                    wrapElem.querySelector("#prescr").innerHTML = decrypted.prescr;
                    wrapElem.querySelector("#birth").innerHTML = decrypted.birth;

                    fields.style.setProperty("filter", "none");
                    overlayDate.style.setProperty("display", "none");
                    btn.innerHTML = 'Nascondi<i class="fa-solid fa-lock button-icon" style="color: #ffffff;"></i>';
                
                }else{

                    fields.style.setProperty("filter", "blur(10px)");
                    overlayDate.style.setProperty("display", "flex");
                    wrapElem.querySelector("#name").innerHTML = '';
                    wrapElem.querySelector("#prescr").innerHTML = '';
                    wrapElem.querySelector("#birth").innerHTML = '';
                    btn.innerHTML = 'Visualizza<i class="fa-solid fa-lock button-icon" style="color: #ffffff;"></i>';
                }
            }
        });
    }
});

async function getPatientPrescriptions(patient){
    try{
        // ottengo le ricette dal contratto
        var prescrArray = []
        // get the prescriptions data retrieving from the smart contract
        const prescriptions = await prescrContract.methods.getPatientPrescriptions(patient, true).call({from: patient});
        
        for(const prescr of prescriptions){
            prescrArray[prescr.id] = {
                data: prescr.encryptedData,
                isUsed: prescr.isUsed
            };
        }
        // retrieving event logs for the patient to obtain doctor address, signature and timestamp of the issued prescription
        const events = await prescrContract.getPastEvents('prescriptionIssued', {
            filter: {patient: patient},  
            fromBlock: 50,
            toBlock: 'latest',
        });

        for(var ev in events){
            const block = await web3.eth.getBlock(events[ev].blockNumber);
            const date = new Date(block.timestamp * 1000); // Convert seconds to milliseconds
            const formattedDate = date.toLocaleDateString("en-GB"); 
            const id = events[ev].returnValues.prescr_id;
            prescrArray[id].doctor = events[ev].returnValues.doctor;
            prescrArray[id].signature = events[ev].returnValues.signature;
            prescrArray[id].timestamp = formattedDate;
        }
        return prescrArray;
    }catch(error){
        console.error("Failed to obtain prescriptions data.");
        console.log(error);
    }
}

function fillPrescriptionCards(prescr, wrapCont) {
    var content = "";
    for(var id in prescr){
        content += `<div class="wrap-elem">
                    <div class="fields">
                        <div class="elem-field">
                            <div class="prescr-h1">ID ricetta: </div>
                            <div class="span" id="prescrID">${id}</div>
                        </div>
                        <div class="elem-field">
                            <div class="prescr-h1">Medico: </div>
                            <div class="span" id="doctor">${prescr[id].doctor}</div>
                        </div>
                        <div class="elem-field">
                            <div class="prescr-h1">Data: </div>
                            <div class="span" id="date">${prescr[id].timestamp}</div>
                        </div>
                        <div class="elem-field">
                            <div class="prescr-h1">Paziente: </div>
                            <div class="span" id="name"></div>
                        </div>
                        <div class="elem-field">
                            <div class="prescr-h1">Data di nascita: </div>
                            <div class="span" id="birth"></div>
                        </div>
                        <div class="elem-field">
                            <div class="prescr-h1">Prescrizione:</div>
                            <div class="span" id="prescr"> </div>
                        </div>
                        <div class="elem-field">
                            <div class="prescr-h1">Utilizzata: </div>
                            <div class="span" id="is-used">${prescr[id].isUsed ? 'Sì' : 'No'}</div>
                        </div>
                    </div>
                    <div class="overlay">
                        <div class="elem-field"><div class="h1" id="overlay-date">${prescr[id].timestamp}</div></div>
                        <button class="button" onclick="">Visualizza<i class="fa-solid fa-unlock button-icon" style="color: #ffffff;"></i></button>
                    </div>
                </div>`;
    }
    wrapCont.innerHTML = content;
}

async function validateSignature(params) {
    
}

async function decryptPrescription(prescriptions, prescrID, patient){
    try {
        // first validate the doctor's signature
        const recoveredAddress = web3.eth.accounts.recover(prescriptions[prescrID].data, prescriptions[prescrID].signature);
        if(recoveredAddress != prescriptions[prescrID].doctor){
            throw new Error("Ricetta non valida: firma invalida.");
        }
        // If valida, decrypt the message using eth_decrypt
        const decryptedMessage = await window.ethereum.request({
            method: "eth_decrypt",
            params: [prescriptions[prescrID].data, patient],
        });

        return JSON.parse(decryptedMessage);

    } catch (error) {
        console.error("Decryption failed", error);
    }
}


// VALIDAZIONE FIRMA CERCANDO NEI LOG DEGLI EVENTI EMESSI DAL CONTRATTO + MARCATURA RICETTA COME UTILIZZATA