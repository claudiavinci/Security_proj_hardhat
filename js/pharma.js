import { getWalletAddress } from "./connectionHandler.js";
import PrescriptionsContract from "./contracts.js";
import { getPatientPrescriptions, fillPrescriptionCards, decryptPrescription } from "./prescriptionsHandler.js";
const patient = "0xF06A218700d980560E4145e13B739C9F52a9faE3";


document.addEventListener("DOMContentLoaded", async () => {
    const patientWallet = document.querySelector("#patient-wallet");
    patientWallet.innerHTML = patient;
    const prescriptionsTuple = await getPatientPrescriptions(patient, true);
    const wrapCont = document.getElementById("wrap-container");
    const sortedPrescr = prescriptionsTuple[0];
    const prescriptions = prescriptionsTuple[1];
    if(Object.keys(prescriptions).length == 0){
        wrapCont.innerHTML = "Non ci sono prescrizioni disponibili.";
    }else{
        // visualizzare le ricette sulla schermata principale
        fillPrescriptionCards(sortedPrescr, wrapCont);
        wrapCont.addEventListener("click", async (event) => {
            const btn = event.target;
            const wrapElem = btn.closest(".wrap-elem");
            const prescrID = wrapElem.querySelector("#prescrID").innerHTML;
            const fields = btn.parentElement.previousElementSibling;
            const overlayInfo = wrapCont.querySelector(".overlay-info");

            // controllo di aver premuto un bottone per evitare eventi indesiderati
            if (btn.tagName === "BUTTON"){
                if(wrapElem.querySelector("#prescr").innerHTML.trim() == ''){
                    const decrypted = await decryptPrescription(prescriptions, prescrID, patient);
                    const name = decrypted.name.split('/');

                    wrapElem.querySelector("#name").innerHTML = name[0] + ' ' + name[1];
                    wrapElem.querySelector("#prescr").innerHTML = decrypted.prescr;
                    wrapElem.querySelector("#birth").innerHTML = decrypted.birth;

                    fields.style.setProperty("filter", "none");
                    overlayInfo.style.setProperty("display", "none");
                    btn.innerHTML = 'Evadi ricetta<i class="fa-solid fa-lock button-icon" style="color: #ffffff;"></i>';
                
                }else{
                    
                }
            }
        });
    }
});