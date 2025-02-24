// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

interface IRoleManagement{
    function getRole(address user) external view returns (bytes32);
}

contract Prescriptions{
    IRoleManagement public roleManagement;

    struct Prescription {
        bytes32 id;
        string encryptedData;
        bool isUsed;
    }

    // maps prescriptions by their IDs (prescriptions stored by ID)
    mapping(bytes32 => Prescription) public prescriptions;

    // maps an array of prescription by patient address 
    mapping(address => bytes32[]) public patientPrescriptions;

    constructor(address _roleManagementAddr){
        roleManagement = IRoleManagement(_roleManagementAddr);
    }

    // modifier to allow the issueing of a prescription only to doctors
    modifier onlyDoctor() {
        address caller = msg.sender;
        bytes32 role = roleManagement.getRole(caller);
        require(role == keccak256(abi.encodePacked("doctor")), "Only a doctor can write a prescription!");
        _;
    }

    // modifier to allow the marking as used only to pharmacists
    modifier onlyPharmacist() {
        address caller = msg.sender;
        bytes32 role = roleManagement.getRole(caller);
        require(role == keccak256(abi.encodePacked("pharmacist")), "Only a pharmacist can mark a prescription as used!");
        _;
    }

    // modifier to avoid that a patient can access to other patient's prescriptions
    modifier authorizedToRead(address _patient) {
        address caller = msg.sender;
        bytes32 role = roleManagement.getRole(caller);
        require(role == keccak256(abi.encodePacked("pharmacist")) || role == keccak256(abi.encodePacked("doctor")) || (role == bytes32(0) && _patient == caller), "You have not the permission to access this prescription!");
        _;
    }

    // EVENTO PER L'INVIO DELLA RICETTA -> DOCTOR ADDRESS, SIGNATURE E ID PRESCRIZIONE -> così evito di memorizzare nel contratto anche indirizzo medico e signature -> meno gas
    event prescriptionIssued(address indexed patient, bytes32 indexed prescr_id, address indexed doctor, string signature);

    // function to store a prescription
    function issuePrescription(address _patient, string memory _encryptedData, string memory _signature) public onlyDoctor {
        // generate unique ID by hashing patient address + timestamp + doctor address -> 
        // also adding doctor address avoids that the same ID is generated if two doctors issue a prescription simultaneously 
        // (even if probability of happening is low)
        bytes32 prescrID = keccak256(abi.encodePacked(_patient, block.number, msg.sender));

        prescriptions[prescrID] = Prescription({
            id: prescrID,
            encryptedData: _encryptedData,
            isUsed: false
        });

        patientPrescriptions[_patient].push(prescrID);

        emit prescriptionIssued(_patient, prescrID, msg.sender, _signature);
    }

    // function to allow a pharmacist to mark a prescription as used, so that it can't be reused
    function markAsUsed(bytes32 _prescrID) public onlyPharmacist {
        require(prescriptions[_prescrID].id != 0, "Prescription doesn't exist!");
        require(!prescriptions[_prescrID].isUsed, "Prescription has been already used!");

        prescriptions[_prescrID].isUsed = true;
    }


    // function to obtain the prescriptions related to a given patient; if unused = true, only the unused prescription will be returned
    function getPatientPrescriptions(address _patient, bool _unused) public view authorizedToRead(_patient) returns (Prescription[] memory) {
        bytes32[] memory prescrIDs;
        if(_unused) {
            // internal call to fetch only the unused prescriptions IDs related to the patient
            prescrIDs = getUnusedPrescriptionsIDs(_patient);
        }else{
            // fetch all the prescriptions IDs related to the patient
            prescrIDs = patientPrescriptions[_patient];
        }
        // internal call to fetch the prescriptions given the IDs obtained before
        return getPrescriptionsByIDs(prescrIDs);
    }

    // internal function to obtain the IDs of unused prescriptions related to a patient
    function getUnusedPrescriptionsIDs(address _patient) internal view returns (bytes32[] memory) {
        uint256 count = patientPrescriptions[_patient].length;
        uint256 unusedCount = 0;

        // counting the number of unused prescriptions related to the patient in order to allocate the array
        for(uint256 i = 0; i < count; i++) {
            bytes32 ID = patientPrescriptions[_patient][i];
            if(!prescriptions[ID].isUsed) {
                unusedCount++;
            }
        }

        bytes32[] memory unusedPrescrIDs = new bytes32[](unusedCount);
        uint256 index = 0;

        for(uint256 i = 0; i < count; i++) {
            bytes32 ID = patientPrescriptions[_patient][i];
            if(!prescriptions[ID].isUsed) {
                unusedPrescrIDs[index] = ID;
                index++; 
            }
        }

        return unusedPrescrIDs;
    }

    // internal functions to obtain the prescriptions (data) by ID
    function getPrescriptionsByIDs(bytes32[] memory _prescrIDs) internal view returns (Prescription[] memory) {
        uint256 count = _prescrIDs.length;
        Prescription[] memory data = new Prescription[](count);

        for(uint256 i = 0; i < count; i++) {
            bytes32 ID = _prescrIDs[i];
            data[i] = prescriptions[ID];
        }
        return data;
    }
}