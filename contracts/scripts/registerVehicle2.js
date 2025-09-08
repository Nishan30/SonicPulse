// scripts/registerVehicle2.js
const hre = require("hardhat");
require("dotenv").config();

const contractAddress = "0xD8aBFcC7897b5bf880b3d5BB96bd9e264118e55a";
const contractABI = require("../abi/VehicleRegistry.json").abi; // Path to the ABI JSON file

async function main() {
  console.log("Getting the deployer/owner wallet...");
  const [ownerSigner] = await hre.ethers.getSigners();
  
  // THIS IS THE ONLY CHANGE: Use the second device's private key
  const deviceWallet = new hre.ethers.Wallet(process.env.DEVICE_PRIVATE_KEY_2);
  const deviceAddress = deviceWallet.address;

  const contract = new hre.ethers.Contract(contractAddress, contractABI, ownerSigner);
  const initialLocation = "34.0580,-118.2437"; // A slightly different starting point

  console.log(`Registering a NEW vehicle and assigning ownership to DEVICE 2: ${deviceAddress}`);
  const tx = await contract.registerVehicle(deviceAddress, initialLocation);
  const receipt = await tx.wait();
  
  // ... (The rest of the smart script to find the new ID remains the same)
  const transferEvent = receipt.logs.find(log => contract.interface.parseLog(log)?.name === 'Transfer');
  if (transferEvent) {
    const parsedLog = contract.interface.parseLog(transferEvent);
    const newTokenId = parsedLog.args.tokenId.toString();
    console.log("✅ Vehicle registration successful!");
    console.log(`✅ NEW VEHICLE ID (FOR DEVICE 2) IS: ${newTokenId}`);
    console.log("ACTION REQUIRED: Update simulator2.js and App.js with this new ID.");
  } else {
    console.error("Could not determine new vehicle ID.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});