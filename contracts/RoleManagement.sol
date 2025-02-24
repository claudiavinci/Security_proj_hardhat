// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RoleManagement {
  address public owner;

  mapping(address => bytes32) public roles;

  constructor() {
    owner = msg.sender;
    roles[0x5a6338523f5fb4682c2F8e15137b8238C9e4e80C] = keccak256(abi.encodePacked("doctor"));
    roles[0xae8cb0F40a5f94FE7D3f020829FcD6560312397f] = keccak256(abi.encodePacked("pharmacist"));
  }

  function getRole(address _user) public view returns (bytes32){
    return roles[_user];
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only the contract owner can perform this action");
    _;
  }

  function setRole(address _user, bytes32 _role) public onlyOwner{
    roles[_user] = _role;
  }
}
