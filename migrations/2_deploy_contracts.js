
const FleaMarketContract = artifacts.require("FleaMarketFactory");

module.exports = async (deployer) => {

  await deployer.deploy(FleaMarketContract);

  const contract = await FleaMarketContract.deployed(); 
  console.log(`Contract has been deployed successfully: ${contract.address}`);
  
};


