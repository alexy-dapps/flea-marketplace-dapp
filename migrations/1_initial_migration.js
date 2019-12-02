const Migrations = artifacts.require("Migrations");

module.exports = function(deployer, network, accounts) {
  console.log('Accounts', accounts);
  deployer.deploy(Migrations);
};

