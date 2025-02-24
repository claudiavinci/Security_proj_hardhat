const web3 = new Web3(window.ethereum);

// ------- LOGIN ---------

export async function loginWithMetaMask(){
    if(window.ethereum){
        try{
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
            console.log(accounts[0]);
            if(!accounts || accounts.length === 0) {
                loginButton.removeAttribute('disabled');
                loginButton.innerHTML = 'Accedi con MetaMask <img src="./img/metamask-icon.svg" class="button-icon" title="metamask" width="25px">';
            }else{
                const userLoggedIn = accounts[0];
                setLoginSessionToken(userLoggedIn);
            }  
        }catch(err){
            console.error(err.message);
        }
    }else{
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Non hai installato MetaMask!",
            footer: '<a href="https://metamask.io/it/download/">Installa MetaMask</a>',
            confirmButtonColor:"#66aff1",
        });
    }
}

// ------- SESSION TOKEN AND ROLE ---------

export async function setLoginSessionToken(userLoggedIn) {
    const response = await fetch("/login", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({addr : userLoggedIn}),
        credentials: 'include', //to allow cookies to
    })
    if(response.redirected){
        window.location.href = response.url;
    }
}

// ---------- LOGOUT --------------

export async function logoutUser() {
    if(window.ethereum){
        const response = await fetch("/logout", {
            method: 'POST',
            credentials: 'include', //to allow cookies to
        });
        if(response.redirected){
            window.location.href = response.url;
        }
    }else{
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Non hai installato MetaMask!",
            footer: '<a href="https://metamask.io/it/download/">Installa MetaMask</a>',
            confirmButtonColor:"#66aff1",
        });
    }
}

// ---------- CHANGE ACCOUNT ------------

export function detectAccountChanges(){
    window.ethereum.on("accountsChanged", handleAccountChange);
}

async function handleAccountChange(){
    const response = await fetch("/logout", {
        method: 'POST',
        credentials: 'include', //to allow cookies to
    })
    if(response.redirected){
        await Swal.fire({
            position: "center",
            icon: "warning",
            title: "Hai cambiato account! Rieffettua il login",
            timer: 2000,
            showConfirmButton: false,
        });
        window.location.href = response.url;
    } 
}

// ------------ GET WALLET ADDRESS ----------

export async function getWalletAddress(){
    if(window.ethereum){
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        const connAccount = accounts[0]
        return connAccount;
    }else{
        console.error("No wallet connected.");
        return;
    }
}
