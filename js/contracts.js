const PrescriptionsContract = {
  address: "0x8C1a8f437Ea376Ba042a7fF0b9e4939867D3cAB4",
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_roleManagementAddr",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "patient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "prescr_id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "doctor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "signature",
          "type": "string"
        }
      ],
      "name": "prescriptionIssued",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_unused",
          "type": "bool"
        }
      ],
      "name": "getPatientPrescriptions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "encryptedData",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isUsed",
              "type": "bool"
            }
          ],
          "internalType": "struct Prescriptions.Prescription[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_patient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_encryptedData",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_signature",
          "type": "string"
        }
      ],
      "name": "issuePrescription",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_prescrID",
          "type": "bytes32"
        }
      ],
      "name": "markAsUsed",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "patientPrescriptions",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "prescriptions",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "encryptedData",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isUsed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "roleManagement",
      "outputs": [
        {
          "internalType": "contract IRoleManagement",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
}

export default PrescriptionsContract;
