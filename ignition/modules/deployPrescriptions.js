const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const fs = require('fs'); 
const path = require('path');

const filePath = path.join(__dirname, './../deployments/chain-11155111/deployed_addresses.json');
const address = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log(address["roleManagement#RoleManagement"]);

const prescriptions = buildModule("Prescriptions", (m) => {
  const prescriptions = m.contract("Prescriptions", [address["roleManagement#RoleManagement"]]);

  return { prescriptions };
});

module.exports = prescriptions;