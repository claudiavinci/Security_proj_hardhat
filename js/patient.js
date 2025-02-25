import { getWalletAddress } from "./connectionHandler.js";
import { getPatientPrescriptions, fillPrescriptionCards, decryptPrescription } from "./prescriptionsHandler.js";

document.addEventListener("DOMContentLoaded", async () => {
    const patient = await getWalletAddress();
    const prescriptionsTuple = await getPatientPrescriptions(patient, false);
    const wrapCont = document.getElementById("wrap-container");
    const sortedPrescr = prescriptionsTuple[0];
    const prescriptions = prescriptionsTuple[1];
    
    if(Object.keys(prescriptions).length == 0){
        wrapCont.innerHTML = "Non ci sono prescrizioni disponibili.";
    }else{
        // visualizzare le ricette sulla schermata principale
        fillPrescriptionCards(sortedPrescr, wrapCont);

        // visualizzare, decifrare quando si seleziona la ricetta specifica
        wrapCont.addEventListener("click", async (event) => {
            const btn = event.target;
            const wrapElem = btn.closest(".wrap-elem");
            const prescrID = wrapElem.querySelector("#prescrID").innerHTML;
            const fields = btn.parentElement.previousElementSibling;
            const overlayInfo = wrapCont.querySelector(".overlay-info");
            

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
                    overlayInfo.style.setProperty("display", "none");
                    btn.innerHTML = 'Nascondi<i class="fa-solid fa-lock button-icon" style="color: #ffffff;"></i>';
                
                }else{

                    fields.style.setProperty("filter", "blur(10px)");
                    overlayInfo.style.setProperty("display", "flex");
                    wrapElem.querySelector("#name").innerHTML = '';
                    wrapElem.querySelector("#prescr").innerHTML = '';
                    wrapElem.querySelector("#birth").innerHTML = '';
                    btn.innerHTML = 'Visualizza<i class="fa-solid fa-lock button-icon" style="color: #ffffff;"></i>';
                }
            }
        });
    }
});