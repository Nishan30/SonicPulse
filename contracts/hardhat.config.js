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
  },
};