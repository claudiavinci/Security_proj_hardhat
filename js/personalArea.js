import { logoutUser, getWalletAddress, detectAccountChanges } from "./connectionHandler.js";

const web3 = new Web3(window.ethereum);

detectAccountChanges();

document.addEventListener("DOMContentLoaded", () => {

    navbar();

    getWalletAddress().then(connAccount => {
        const wallet = document.getElementById("wallet");
        wallet.innerText = connAccount;
    })
    
    const logoutButton = document.getElementById('logout');

    logoutButton.addEventListener('click', async() => {
        logoutUser();
    });
    
});

function navbar(){
    const navbarContent = `<div class="left">
                                <img src="../img/SRD_logo.svg" alt="Sistema Ricetta Digitale" id="logo">
                                <div class="elem">
                                    <span class="nav-span">Prova</span>
                                </div>
                                <div class="elem">
                                    <span class="nav-span">Prova</span>
                                </div>
                            </div>
                            
                            <div class="right">
                                <i id="logout" class="fa-solid fa-arrow-right-from-bracket" style="color: #ffffff;"></i>
                            </div>`;

    const navbar = document.getElementById('navbar');
    navbar.innerHTML = navbarContent;
}
