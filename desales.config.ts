import {getDefaultWallets} from "@rainbow-me/rainbowkit";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet, polygonMumbai
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


/* @todo: define topos chains
https://wagmi.sh/react/chains#build-your-own
 const topos...
 */

 const productionChain = polygonMumbai /*todo: use topos */

 const envChains = process.env.NODE_ENV === "production" ? [productionChain] : [hardhat, productionChain, /*todo: add topos */]

 const { chains, publicClient } = configureChains(
  envChains,
    [
      publicProvider()
    ]
  );
  
 const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains
  });
  
 const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })

  export const desalesChains = chains
  export const desalesWagmiConfig = wagmiConfig

export const AuctionAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const DesalesNFTAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
export const MockStableCoinAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  export const chain = process.env.NODE_ENV === "production" ? productionChain : hardhat