
import { getWalletAddress } from "./connectionHandler.js";
import PrescriptionsContract from "./contracts.js";

const web3 = new Web3(window.ethereum);
const prescrContract = new web3.eth.Contract(PrescriptionsContract.abi, PrescriptionsContract.address); 

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-prescr");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const timestamp = Date.now(); // Current timestamp
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
                    console.log("Confermato");
                    await sendPrescription(prescription);
                    form.reset();
                }
            });
    })
});

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

async function sendPrescription(prescription) {

    const doctor = await getWalletAddress();
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
        const estimatedGas = await prescrContract.methods.issuePrescription(prescription.wallet, encryptedHex[0], signature).estimateGas({ from: doctor});
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




