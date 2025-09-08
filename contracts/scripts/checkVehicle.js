// scripts/checkVehicles.js
const hre = require("hardhat");

// --- IMPORTANT: Paste your LATEST VehicleRegistry contract address here ---
const contractAddress = "0xD8aBFcC7897b5bf880b3d5BB96bd9e264118e55a";
const contractABI = require("../abi/VehicleRegistry.json").abi; 

async function main() {
  console.log(`Checking for registered vehicles on contract: ${contractAddress}`);

  // We only need a provider to read data, not a signer.
  const provider = hre.ethers.provider;
  const contract = new hre.ethers.Contract(contractAddress, contractABI, provider);

  let currentId = 1;
  let vehiclesFound = 0;
  while (true) {
    try {
      // Use Promise.all to fetch owner and state at the same time for efficiency
      const [owner, vehicleState] = await Promise.all([
          contract.ownerOf(currentId),
          contract.getVehicleState(currentId)
      ]);

      // --- NEW LOGIC TO PROCESS AND DISPLAY MORE DATA ---
      const location = vehicleState[1]; // Location is at index 1 of the returned struct
      const statusEnum = Number(vehicleState[4]); // Status is at index 4

      let statusString = "Moving";
      if (statusEnum === 1) statusString = "Waiting";
      if (statusEnum === 2) statusString = "Crossing";

      // Print a more detailed summary for each vehicle
      console.log(`\n--- Vehicle ID #${currentId} ---`);
      console.log(`  ✅ Owner: ${owner}`);
      console.log(`  📍 Location: ${location}`);
      console.log(`  🚦 Status: ${statusString}`);
      
      vehiclesFound++;
      currentId++;
    } catch (error) {
      // If ownerOf fails, the token ID does not exist.
      console.log(`\n❌ Could not find Vehicle ID #${currentId}.`);
      console.log("Search complete.");
      break; // Exit the loop
    }
  }

  // The last successful ID is one less than the current ID.
  if (vehiclesFound > 0) {
    console.log(`\n======================================================`);
    console.log(`➡️ Found a total of ${vehiclesFound} vehicle(s).`);
    console.log(`➡️ The latest valid Vehicle ID is: ${currentId - 1}`);
    console.log(`======================================================`);
  } else {
    console.log("\nNo vehicles found on this contract.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});