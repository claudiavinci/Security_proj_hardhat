import { getWalletAddress } from "./connectionHandler.js";
import PrescriptionsContract from "./contracts.js";
import { getPatientPrescriptions, fillPrescriptionCards, decryptPrescription, markAsUsed } from "./prescriptionsHandler.js";
// paziente 1
const patient = "0xF06A218700d980560E4145e13B739C9F52a9faE3";
// paziente 2
// const patient = "0xA7452e24300F1080E8c0195AeC1F1336Be3BcfeD";


document.addEventListener("DOMContentLoaded", async () => {
    const pharmacist = await getWalletAddress();
    const patientWallet = document.querySelector("#patient-wallet");
    patientWallet.innerHTML = patient;
    const prescriptionsTuple = await getPatientPrescriptions(patient, pharmacist, true);
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
                    console.log("DENTRO IF")
                    console.log(wrapElem.querySelector("#prescr").innerHTML)
                    Swal.fire({
                        title: 'Richiesta autorizzazione decifratura...',
                        text: "Attendi fino alla conferma dell'autorizzazione",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading(); // Show the loading spinner
                        },
                        customClass: {
                            title: "summaryh1",
                        },
                    });
                    try{
                        const decrypted = await decryptPrescription(prescriptions, prescrID, patient);
                        const name = decrypted.name.split('/');

                        wrapElem.querySelector("#name").innerHTML = name[0] + ' ' + name[1];
                        wrapElem.querySelector("#prescr").innerHTML = decrypted.prescr;
                        wrapElem.querySelector("#birth").innerHTML = decrypted.birth;
    
                        fields.style.setProperty("filter", "none");
                        overlayInfo.style.setProperty("display", "none");
                        btn.innerHTML = 'Evadi ricetta<i class="fa-solid fa-lock button-icon" style="color: #ffffff;"></i>';
                        Swal.fire({
                            icon: 'success',
                            title: 'Autorizzata!',
                            customClass: {
                                confirmButton: "button",
                                title: "summaryh1",
                            }
                        });    
                    }catch(error){
                        Swal.fire({
                            icon: 'error',
                            title: 'Decifratura non riuscita!',
                            text: "Si è verificato un errore nella decifratura della ricetta",
                            customClass: {
                                confirmButton: "button",
                                title: "summaryh1",
                            }
                        });
                        console.error(error);
                    }
                }else{
                    Swal.fire({
                        title: 'Evasione ricetta...',
                        text: 'Attendi fino alla conferma di marcatura della ricetta',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: () => {
                            Swal.showLoading(); // Show the loading spinner
                        },
                        customClass: {
                            title: "summaryh1",
                        },
                    });
                    // DA TESTARE: EVASIONE RICETTA E RICARICAMENTO PAGINA 
                    try{
                        await markAsUsed(prescrID, pharmacist);
                        Swal.fire({
                            icon: 'success',
                            title: 'Ricetta evasa!',
                            text: "La ricetta è stata utilizzata correttamente",
                            customClass: {
                                confirmButton: "button",
                                title: "summaryh1",
                            }
                        }); 
                        location.reload()
                    }catch(error){
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore nella marcatura!',
                            text: "Si è verificato un errore nella decifratura della ricetta",
                            customClass: {
                                confirmButton: "button",
                                title: "summaryh1",
                            }
                        });
                        console.error(error);
                    }
                }
            }
        });
    }
});