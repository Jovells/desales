import {getDefaultWallets} from "@rainbow-me/rainbowkit";
  import { configureChains, createConfig } from 'wagmi';
  import {
  hardhat, mainnet, polygonMumbai, telosTestnet
  } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';



 const productionChain = telosTestnet 

 const envChains = process.env.NODE_ENV === "production" ? [productionChain] : [hardhat, productionChain]

 const { chains, publicClient } = configureChains(
  envChains,
    [
      publicProvider()
    ]
  );
  
 const { connectors } = getDefaultWallets({
    appName: 'Desales',
    projectId: '4bb311e76fca80e38887406bc212442d',
    chains
  });
  
 const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  })

  export const desalesChains = chains
  export const desalesWagmiConfig = wagmiConfig

export const AuctionAddress = "0x695C1De27A868d772263c605eD9d9Cc855511754";
export const DesalesNFTAddress = "0x23DD585F4600cc26744CEE8A3F710cF3546a8967";
export const MockStableCoinAddress = "0x9d9592dF49D8E36b001C0A1AD65EAAadcD0b58b7";

  export const chain = process.env.NODE_ENV === "production" ? productionChain : telosTestnet