
import { getWalletAddress } from "./connectionHandler.js";
import { sendPrescription } from "./prescriptionsHandler.js"

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-prescr");
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        // const timestamp = Date.now(); // Current timestamp
        const formattedDate = new Date(document.getElementById("birth").value).toLocaleDateString();
        const prescription = { 
            wallet: document.getElementById("walletaddr").value,
            name: document.getElementById("name").value + '/' + document.getElementById("surname").value,
            birth: formattedDate,
            prescr: document.getElementById("prescr").value,
        }

        const name = prescription.name.split('/');

        await Swal.fire({
            title: "Riepilogo",
            html: `<div class="summary">
                        <div>
                            <span class="summ-field">Wallet Address del paziente:</span>
                        </div>
                        <div>
                            <span>${prescription.wallet}</span>
                        </div>
                        <div>
                            <span class="summ-field">Paziente:</span> <span>${name[0]} ${name[1]}</span>
                        </div>
                        <div>
                            <span class="summ-field">Data di nascita:</span> <span>${prescription.birth}</span>
                        </div>
                        <div>
                            <span class="summ-field">Ricetta:</span> <span>${prescription.prescr}</span>
                        </div>
                    </div>`,
            showCancelButton: true,
            confirmButtonText: 'Conferma',
            customClass: {
                confirmButton: "button",
                cancelButton: "cancel",
                title: "summaryh1",
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Invio ricetta...',
                    text: 'Attendi fino alla conferma di invio della ricetta',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading(); // Show the loading spinner
                    }
                });
                const doctor = await getWalletAddress();
                try {
                    await sendPrescription(prescription, doctor, prescription.wallet);
                    console.log("Confirmed");

                    // Update the popup with success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Ricetta inviata!',
                        text: 'La ricetta è stata inviata correttamente',
                        customClass: {
                            confirmButton: "button",
                            title: "summaryh1",
                        }
                    });

                    form.reset();

                } catch (error) {
                    // Update the popup with error message
                    Swal.fire({
                        icon: 'error',
                        title: 'Invio non riuscito',
                        text: "Si è verificato un errore nell'invio della ricetta",
                        customClass: {
                            confirmButton: "button",
                            title: "summaryh1",
                        }
                    });
                    console.error(error);
                }
            }
        });
    })
});





