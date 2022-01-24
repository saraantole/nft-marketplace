const Marketplace = artifacts.require("Marketplace");
const NFT = artifacts.require("Nft");

module.exports = function (deployer) {
  deployer.deploy(Marketplace)
  .then(() => deployer.deploy(NFT, Marketplace.address));
};
