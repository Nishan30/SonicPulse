// scripts/deploy.ts

import hre from "hardhat";

async function main() {
  console.log("Deploying VehicleRegistry contract with Viem...");

  // Get the deployer wallet client
  // In Viem, we work with "Wallet Clients" instead of "Signers"
  const [deployer] = await hre.viem.getWalletClients();

  console.log(
    "Deploying contracts with the account:",
    deployer.account.address
  );

  // Deploy the contract using hre.viem.deployContract
  // The first argument is the contract name.
  // The second is an array of constructor arguments.
  const vehicleRegistry = await hre.viem.deployContract("VehicleRegistry", [
    deployer.account.address, // The constructor argument for initialOwner
  ]);

  // The deployed contract address is available on the .address property
  console.log(
    `VehicleRegistry contract deployed to: ${vehicleRegistry.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});