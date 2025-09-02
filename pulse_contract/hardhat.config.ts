// hardhat.config.ts

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem"; // Use the Viem toolbox
import * as dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Add the sonic network configuration here
    sonic: {
      type: "http", 
      url: "https://rpc.testnet.soniclabs.com/",
      accounts:
        process.env.SONIC_PRIVATE_KEY !== undefined
          ? [process.env.SONIC_PRIVATE_KEY]
          : [],
      chainId: 14601,
    },
  },
};

export default config;