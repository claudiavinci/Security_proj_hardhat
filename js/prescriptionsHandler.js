import PrescriptionsContract from "./contracts.js";
const web3 = new Web3(window.ethereum);
const prescrContract = new web3.eth.Contract(PrescriptionsContract.abi, PrescriptionsContract.address); 

// ENCRYPTION WORKFLOW: 
// 1. json 
// 2. stringify per mandare la post
// 3. ritorna criptata e in esadecimale per la firma
// 5. firma del medico con metamask
// 6. stringify per smart contract

// DECRYPTION WORKFLOW
// 1. stringa dallo smart contract
// 2. to JSON
// 3. verifica della firma del medico
// 4. decifrare con metamask

export async function sendPrescription(prescription, doctor) {

    const response = await fetch("/encryptPrescription", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(prescription),
        credentials: 'include', //to allow cookies to
    })
    if(response.ok){
        const encryptedHex = await response.json();

        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [encryptedHex[0], doctor]
        });

        console.log(signature);
        // const estimatedGas = await prescrContract.methods.issuePrescription(prescription.wallet, encryptedHex[0], signature).estimateGas({ from: doctor});
        const tx = await prescrContract.methods.issuePrescription(prescription.wallet, encryptedHex[0], signature).send({
            from: doctor,
            // gas: Math.round(estimatedGas * 1.2),
            // gasPrice: web3.utils.toWei('50', 'gwei'),
        }, (error, transactionHash) => {
            if(error){
                console.log(error);
            }else{
                console.log(transactionHash);
            }
        });
    }
}


export async function getPatientPrescriptions(patient, unused){
    try{
        // ottengo le ricette dal contratto
        var prescrArray = []
        // get the prescriptions data retrieving from the smart contract
        const prescriptions = await prescrContract.methods.getPatientPrescriptions(patient, unused).call({from: patient});
        
        for(let prescr of prescriptions){
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

        for(let ev in events){
            const block = await web3.eth.getBlock(events[ev].blockNumber);
            const date = new Date(block.timestamp * 1000); // Convert seconds to milliseconds
            const formattedDate = date.toLocaleDateString("en-GB"); 
            const id = events[ev].returnValues.prescr_id;
            prescrArray[id].doctor = events[ev].returnValues.doctor;
            prescrArray[id].signature = events[ev].returnValues.signature;
            prescrArray[id].timestamp = formattedDate;
        }

        var sortedPrescr = []
        var sorted = Object.entries(prescrArray).sort((a, b) => {
            new Date(a[1].timestamp) - new Date(b[1].timestamp)
        }).reverse();

        sorted.forEach((elem) => {
            let prescr = {}
            prescr[elem[0]] = elem[1]
            sortedPrescr.push(prescr)
        });

        return [sortedPrescr, prescrArray];

    }catch(error){
        console.error("Failed to obtain prescriptions data.");
        console.log(error);
    }
}

export function fillPrescriptionCards(sortedPrescr, wrapCont) {
    var content = "";
    sortedPrescr.forEach((prescr) => {
        let id = Object.keys(prescr)[0]
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
                        <div class="elem-field overlay-info">
                            <div class="h1" id="overlay-date">${prescr[id].timestamp}</div>
                            <div class="h1" id="overlay-isUsed">${prescr[id].isUsed ? '<i class="fa-solid fa-circle-check" style="color: #44569b;"></i>' : '<i class="fa-regular fa-circle" style="color: #44569b;"></i>'}</div>
                        </div>
                        <button class="button" onclick="">Visualizza<i class="fa-solid fa-unlock button-icon" style="color: #ffffff;"></i></button>
                    </div>
                </div>`;
    })
    wrapCont.innerHTML = content;
}

export async function decryptPrescription(prescriptions, prescrID, patient){
    try {
        // first validate the doctor's signature
        const recoveredAddress = web3.eth.accounts.recover(prescriptions[prescrID].data, prescriptions[prescrID].signature);
        if(recoveredAddress != prescriptions[prescrID].doctor){
            throw new Error("Ricetta non valida: firma invalida.");
        }
        
        // If valid, decrypt the message using eth_decrypt
        const decryptedMessage = await window.ethereum.request({
            method: "eth_decrypt",
            params: [prescriptions[prescrID].data, patient],
        });

        return JSON.parse(decryptedMessage);

    } catch (error) {
        console.error("Decryption failed", error);
    }
}
