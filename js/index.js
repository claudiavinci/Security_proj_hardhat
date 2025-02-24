import { loginWithMetaMask } from "./connectionHandler.js";

document.addEventListener("DOMContentLoaded", () => {

    const loginButton = document.getElementById('login');

    loginButton.addEventListener('click', async() => {
        loginButton.setAttribute('disabled', '');
        loginButton.innerHTML = 'Accesso in corso... <img src="./img/metamask-icon.svg" class="button-icon" title="metamask" width="25px">';
        await loginWithMetaMask();
        loginButton.removeAttribute('disabled')
        loginButton.innerHTML = 'Accedi con MetaMask <img src="./img/metamask-icon.svg" class="button-icon" title="metamask" width="25px">'
    });
});