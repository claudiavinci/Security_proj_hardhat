const { hardhat } = require("hardhat");
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const Web3 = require('web3').default;
const path = require('path');
const cookieParser = require('cookie-parser');
const ethSigUtil = require('@metamask/eth-sig-util');

const hardhatConfig = require("./hardhat.config.js");
require("dotenv").config({ path: "./.env" });

const BLOCKCHAIN = hardhatConfig.networks.sepolia.url;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const contractsAddresses = require("./ignition/deployments/chain-11155111/deployed_addresses.json");
const roleManagementContract = require("./artifacts/contracts/RoleManagement.sol/RoleManagement.json");

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.json());

app.use(cookieParser());

const web3 = new Web3(BLOCKCHAIN);
console.log(BLOCKCHAIN);
const roleContract = new web3.eth.Contract(roleManagementContract.abi, contractsAddresses['roleManagement#RoleManagement']);

// --------------- ROUTES --------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/doctor', (req, res) => {
    const token = req.cookies.token;
    if(!token){
        return res.redirect('/');
    }
    try{
        const decoded_token = jwt.verify(token, JWT_SECRET_KEY);
        if(decoded_token.role === web3.utils.keccak256("doctor")){
            res.sendFile(path.join(__dirname + "/html/doctor.html"));
        }
        else{
            res.status(401).redirect('/');
        }
    }
    catch(err){
        res.status(401).redirect('/');
    }
});

app.get('/pharma', (req, res) => {
    const token = req.cookies.token;
    if(!token){
        return res.redirect('/');
    }
    try{
        const decoded_token = jwt.verify(token, JWT_SECRET_KEY);
        if(decoded_token.role === web3.utils.keccak256("pharmacist")){
            res.sendFile(path.join(__dirname + "/html/pharma.html"));
        }
        else{
            res.status(401).redirect('/');
        }
    }
    catch(err){
        res.status(401).redirect('/');
    }
});

app.get('/patient', (req, res) => {
    const token = req.cookies.token;
    if(!token){
        return res.redirect('/');
    }
    try{
        const decoded_token = jwt.verify(token, JWT_SECRET_KEY);
        if(decoded_token.role != web3.utils.keccak256("pharmacist") && decoded_token.role != web3.utils.keccak256("doctor")){
            res.sendFile(path.join(__dirname + "/html/patient.html"));
        }
        else{
            res.status(401).redirect('/');
        }
    }
    catch(err){
        res.status(401).redirect('/');
    }
});

app.post('/login', async (req, res) => {
    const address = req.body;
    try{
        role = await roleContract.methods.getRole(address.addr).call();
        // role_string = web3.utils.toAscii(role).replace(/\0+$/, '');

    }catch(error){
        console.error("failed to obtain the role");
    }
    const token = jwt.sign({addr: address, role: role}, JWT_SECRET_KEY, {expiresIn: '1h'});
    res.cookie('token', token, {
       httpOnly: true, 
       secure: true,
       maxAge: 60*60*1000 
    });
    if (role == web3.utils.keccak256("doctor")) {
        res.redirect('/doctor');
    }
    else if (role == web3.utils.keccak256("pharmacist")) {
        res.redirect('/pharma');
    }
    else {
        res.redirect('/patient');
    }

});

app.post('/logout', (req, res) => {
    const token = req.cookies.token;
    if(!token) {
        return res.redirect('/');
    }
    try{
        const decoded_token = jwt.verify(token, JWT_SECRET_KEY);
        res.clearCookie('token', {
            httpOnly: true, 
            secure: true,
        });
        res.redirect('/');
    }
    catch(err){
        res.status(401).redirect('/');
    }
    
});

app.post('/encryptPrescription', (req, res) => {
    // encryption public key of patient which has to authorize the retrieving of the public key
    const encryptionPublicKey = "fxcAZDagqXrg0QZoH6ostKb902PkJ9U7necfeE7YeVg=";
    const prescription = req.body;

    // produce un JSON contenente i dati cifrati più altri metadati
    const encryptedData = ethSigUtil.encrypt({
        publicKey: encryptionPublicKey,
        data: JSON.stringify(prescription),
        version: "x25519-xsalsa20-poly1305"
    }) 
    console.log(encryptedData);

    const encryptedHex = web3.utils.utf8ToHex(JSON.stringify(encryptedData), "utf8");

    console.log(encryptedHex);

    res.send([encryptedHex]);
})


app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});


