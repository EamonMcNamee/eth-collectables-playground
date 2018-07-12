const MyUniqueCollectables = artifacts.require("./MyUniqueCollectables.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MyUniqueCollectables, "MyUniqueCollectables", "MyUniqueCollectables")
  const erc721 = await MyUniqueCollectables.deployed()
};