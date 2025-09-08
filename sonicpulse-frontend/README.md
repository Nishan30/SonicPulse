# SonicPulse – Real-Time On-Chain Coordination

> Decentralized infrastructure for real-time coordination of moving things.

[![Live Demo](https://sonicpulse-two.vercel.app/)]
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SonicPulse is a proof-of-concept demonstrating a decentralized, real-time coordination layer for IoT devices, such as vehicles and drones, built on the **Sonic blockchain**.

---

## 🚀 The Problem

Current traffic, delivery, and IoT systems are centralized, leading to single points of failure, vendor lock-in, and a lack of trust between competing entities (e.g., two different delivery companies). Furthermore, most blockchains are too slow and expensive for the high-frequency updates required for real-time coordination.

## ✨ The Solution

SonicPulse leverages the unique features of the Sonic blockchain to create a trustless, real-time coordination layer.

-   **On-Chain State:** Devices stream state updates (location, speed) directly to the blockchain.
-   **Smart Coordination:** Smart contracts govern access to shared resources, like intersections, with sub-second finality.
-   **Dynamic NFTs:** Each vehicle is a dynamic NFT, with its metadata reflecting its live, on-chain state.
-   **Gas-Free Experience:** Using a "Sponsor" model (simulating Sonic's FeeM), device transactions can be paid for by a sponsoring entity (like a city or a company), removing the friction of gas fees for end-users and devices.

## 🔗 Live Demo

You can view a live, two-vehicle simulation running on the Sonic Testnet here:

**[https://YOUR_NETLIFY_DEPLOYMENT_URL](https://YOUR_NETLIFY_DEPLOYMENT_URL)**

## ⚡ Why Sonic?

This project is only possible on a high-performance blockchain like Sonic.

| Sonic Feature         | Advantage for SonicPulse                               |
| --------------------- | ------------------------------------------------------ |
| **Sub-second Finality** | Enables real-time, high-stakes decisions for vehicles. |
| **Low Gas Fees**      | Makes high-frequency updates economically viable.      |
| **FeeM (Simulated)**  | Allows for a seamless, "gas-free" user experience.     |
| **EVM Compatibility** | Enabled rapid development with familiar Solidity tools.  |

## 🛠️ Tech Stack

-   **Blockchain:** Sonic Testnet
-   **Smart Contracts:** Solidity, Hardhat, Ethers.js
-   **Frontend:** React, Leaflet.js
-   **Dynamic NFT API:** Vercel Serverless Functions
-   **Simulators:** Node.js

## 🖥️ Running the Project Locally

To run the full simulation on your local machine, you will need three terminal windows.

### Prerequisites

-   Node.js (v18+)
-   npm / yarn
-   A MetaMask wallet funded with Sonic Testnet tokens from the [Sonic Faucet](https://testnet.soniclabs.com/account).

### 1. Backend Setup (Contracts & Simulators)

```bash
# Clone the repository
git clone [YOUR_GITHUB_REPO_URL]
cd [YOUR_REPO_NAME]/contracts

# Install dependencies
npm install

# Create a .env file and add your private keys
# (see .env.example)
cp .env.example .env
# Now, edit the .env file with your keys

# Compile the smart contracts
npx hardhat compile

# Deploy the contracts to the Sonic Testnet
npx hardhat run scripts/deploy.js --network sonic
# (This will give you the contract address)

# IMPORTANT: Update the contract address in all simulator files
# and registration scripts.

# Register the two vehicles
npx hardhat run scripts/registerVehicle.js --network sonic
npx hardhat run scripts/registerVehicle2.js --network sonic
# (Note the Vehicle IDs this script outputs)

# IMPORTANT: Update the Vehicle IDs in the simulator and frontend files.