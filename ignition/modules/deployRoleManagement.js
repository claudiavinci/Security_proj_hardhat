const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const roleManagement = buildModule("roleManagement", (m) => {
  const roleManagement = m.contract("RoleManagement");

  return { roleManagement };
});


module.exports = roleManagement;

