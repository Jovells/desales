import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv'
dotenv.config();
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers")

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks :{
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
      telos_testnet: {
        url: "https://testnet.telos.net/evm",
        accounts: [process.env.PRIVATE_KEY as string],
        chainId: 41,
      },
  }
};

export default config;
