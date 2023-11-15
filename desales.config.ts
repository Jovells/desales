import {getDefaultWallets} from "@rainbow-me/rainbowkit";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet, polygonMumbai, telosTestnet
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';




/* @todo: define topos chains
https://wagmi.sh/react/chains#build-your-own
 const topos...
 */

 const productionChain = telosTestnet /*todo: use topos */

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

export const AuctionAddress = "0x0aDa7CfA69Add88C2BF2B2e15979A4d509Deaa1A";
export const DesalesNFTAddress = "0x15679521316EF7ce5a5D6C320154CffF84447257";
export const MockStableCoinAddress = "0x9d9592dF49D8E36b001C0A1AD65EAAadcD0b58b7";

  export const chain = process.env.NODE_ENV === "production" ? productionChain : hardhat