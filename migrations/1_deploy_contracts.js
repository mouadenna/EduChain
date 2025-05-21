const EduChain = artifacts.require("EduChain");

module.exports = function(deployer) {
  deployer.deploy(EduChain)
    .then(() => {
      console.log("Contract deployed at:", EduChain.address);
    });
}; 