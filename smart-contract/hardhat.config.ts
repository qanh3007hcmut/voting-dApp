import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-verify";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: [
        process.env.ACCOUNT_1 || "",
        process.env.ACCOUNT_2 || "",
        process.env.ACCOUNT_3 || "",
        process.env.ACCOUNT_4 || "",
        process.env.ACCOUNT_5 || "",
      ].filter(account => account !== ""),
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user_1: {
      default: 1,
    },
    user_2: {
      default: 2,
    },
    user_3: {
      default: 3,
    },
    user_4: {
      default: 4,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  },
};

export default config;