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
    }
});