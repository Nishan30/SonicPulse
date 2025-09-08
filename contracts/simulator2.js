// simulator2.js (FINAL, SMART COORDINATION VERSION)
const { ethers } = require("ethers");
require("dotenv").config();

const contractAddress = "0xD8aBFcC7897b5bf880b3d5BB96bd9e264118e55a";
const contractABI = require("./abi/VehicleRegistry.json").abi; // Path to the ABI JSON file

// --- ACTION REQUIRED: Use the correct ID for Vehicle 2 ---
const vehicleId = 2; // Or whatever your ID is for the second vehicle

// --- DEFINE THE SHARED INTERSECTION ---
const INTERSECTION_ID = 0;
const INTERSECTION_CROSSING_INDEX = 2;
const INTERSECTION_APPROACH_COORD = "34.0550,-118.2490"; // Point just before the intersection

// This vehicle will travel West to East (horizontally)
const path = [
  "34.0555,-118.2515",
  "34.0555,-118.2507",
  "34.0555,-118.2500", // The Intersection
  "34.0555,-118.2493",
  "34.0555,-118.2485",
];
let pathIndex = 0;

async function main() {
  console.log(`[Vehicle #${vehicleId}] Starting SMART simulator...`);

  const provider = new ethers.JsonRpcProvider("https://rpc.testnet.soniclabs.com/");
  const deviceWallet = new ethers.Wallet(process.env.DEVICE_PRIVATE_KEY_2, provider);
  const contract = new ethers.Contract(contractAddress, contractABI, deviceWallet);
  console.log(`[Vehicle #${vehicleId}] Simulator running for device: ${deviceWallet.address}`);

  const updateLoop = async () => {
    try {
      const currentCoord = path[pathIndex];

      // Are we at the intersection point?
      if (pathIndex === INTERSECTION_CROSSING_INDEX) {
        console.log(`[Vehicle #${vehicleId}] At intersection. Requesting access...`);
        const tx = await contract.requestToCross(vehicleId, INTERSECTION_ID);
        await tx.wait();
        console.log(`[Vehicle #${vehicleId}] ✅ Access request processed.`);

        // After requesting, we MUST check our on-chain status to see if we can proceed.
        const onChainData = await contract.getVehicleState(vehicleId);
        if (Number(onChainData.status) === 2) { // 2 is "Crossing"
          console.log(`[Vehicle #${vehicleId}] ✅ Access GRANTED. Proceeding.`);
          // Only if access is granted, we advance our path index.
          pathIndex = (pathIndex + 1) % path.length;
        } else {
          console.log(`[Vehicle #${vehicleId}] 🟡 Access DENIED. Waiting at intersection.`);
          // If denied, we DO NOT advance pathIndex. We will try again in the next loop.
        }
      } else {
        // If not at the intersection, just send a normal update.
        console.log(`[Vehicle #${vehicleId}] Moving to ${currentCoord}...`);
        const tx = await contract.updateVehicleState(vehicleId, currentCoord, 50);
        await tx.wait();
        console.log(`[Vehicle #${vehicleId}] ✅ Location update successful.`);
        // Only advance our path index after a successful update.
        pathIndex = (pathIndex + 1) % path.length;
      }
    } catch (error) {
        console.error(`[Vehicle #${vehicleId}] ❌ An error occurred:`, error.message);
    } finally {
      setTimeout(updateLoop, 4000); // Loop every 4 seconds
    }
  };
  
  updateLoop();
}

main();