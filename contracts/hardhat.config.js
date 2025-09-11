require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sonic: {
      url: "https://rpc.testnet.soniclabs.com/",
      accounts: [process.env.SONIC_PRIVATE_KEY],
      chainId: 14601,
    },
    mainnet: { // --- ADD THIS NEW SECTION ---
      url: "https://rpc.soniclabs.com/",
      accounts: [process.env.DEVICE_PRIVATE_KEY_2], // It will read the same key
      chainId: 146, // The official Sonic Mainnet Chain ID
    },
  },
};