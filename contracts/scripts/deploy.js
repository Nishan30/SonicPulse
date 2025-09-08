// scripts/deploy.js (FINAL, CORRECTED DEPLOYMENT LOGIC WITH WAIT)
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy TrafficControl
  console.log("Deploying TrafficControl...");
  const trafficControl = await hre.ethers.deployContract("TrafficControl", [deployer.address]);
  
  // --- THIS IS THE CRITICAL FIX ---
  // We explicitly wait for the contract to be fully mined and ready.
  await trafficControl.waitForDeployment();
  console.log("✅ TrafficControl deployed and ready at:", trafficControl.target);

  // 2. Deploy VehicleRegistry
  console.log("\nDeploying VehicleRegistry...");
  const vehicleRegistry = await hre.ethers.deployContract("VehicleRegistry", [
    deployer.address,
    trafficControl.target,
  ]);
  await vehicleRegistry.waitForDeployment();
  console.log("✅ VehicleRegistry deployed and ready at:", vehicleRegistry.target);

  // 3. Authorize VehicleRegistry to call TrafficControl
  console.log("\nAuthorizing VehicleRegistry to call TrafficControl...");
  // Now that we've waited, this call will succeed.
  const tx = await trafficControl.setAuthorizedCaller(vehicleRegistry.target, true);
  await tx.wait(); // Wait for the authorization transaction to be mined
  console.log("✅ Authorization successful!");

  console.log("\n🚀 Deployment complete! Use the new VehicleRegistry address for all configurations.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});