require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./.env" });
/** @type import('hardhat/config').HardhatUserConfig */

console.log("INFURA_API_KEY:", process.env.INFURA_API_KEY);
console.log("MNEMONIC:", process.env.MNEMONIC);

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.SSN_ACCOUNT_PRIVATE_KEY],
    },
  },
};
