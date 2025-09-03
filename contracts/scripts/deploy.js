const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const VehicleRegistry = await hre.ethers.getContractFactory("VehicleRegistry");
  const vehicleRegistry = await VehicleRegistry.deploy(deployer.address);
  console.log("VehicleRegistry deployed to:", vehicleRegistry.target);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});