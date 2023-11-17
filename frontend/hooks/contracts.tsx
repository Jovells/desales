"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { AuctionAddress, DesalesNFTAddress, MockStableCoinAddress, chain } from "../desales.config";
import {Auction} from "../../typechain-types/contracts/Auction";
import {DesalesNFT} from "../../typechain-types/contracts/DesalesNFT";
import {MockStableCoin} from "../../typechain-types/contracts/MockStableCoin";
import AuctionData from "../../artifacts/contracts/Auction.sol/Auction.json";
import DesalesNFTData from "../../artifacts/contracts/DesalesNFT.sol/DesalesNFT.json";
import MockStableCoinData from "../../artifacts/contracts/MockStableCoin.sol/MockStableCoin.json";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useChainModal } from "@rainbow-me/rainbowkit";
import LoadingComponent from "../components/LoadingComponent";



interface ContractContext {
  Auction: Auction;
  DesalesNFT: DesalesNFT;
  MockStableCoin: MockStableCoin;
}

declare global {
    interface Window {
      ethereum: any;
    }
  }

const ContractContext = createContext<ContractContext | null>(null);

export function useContracts(): ContractContext{
  const contractContext = useContext(ContractContext);
  const {openChainModal} = useChainModal()
  console.log('openChainModal', openChainModal)

  useEffect(() => {
    const currentChainId = parseInt(window?.ethereum?.chainId);
    if(currentChainId !== chain.id && openChainModal){
      toast("please switch to Telos Network")
      openChainModal()
    }
  }, [openChainModal])
  
  

  if (!contractContext) {
    throw new Error("Contract context is not available");
  }


  return contractContext;
}

export function ContractProvider({ children }: { children: React.ReactNode }) {

  const [contracts, setContracts] = useState<ContractContext | null>(null);
  const account = useAccount()

  let currentChainId : number
  try{
   currentChainId = parseInt(window.ethereum.chainId);
  }catch(e){
    console.log(e)
  }

  useEffect(() => {
    if (typeof window == "undefined") {
      return;
    }
    console.log(account)

    
    async function fetchContracts() {
      let provider
      if(currentChainId !== chain.id){
        provider = new ethers.JsonRpcProvider(chain.rpcUrls.default.http[0], chain.id);
 
      }else{
        provider = new ethers.BrowserProvider(window.ethereum);
      }

      let runner
  
      try {
        const signer = await provider.getSigner();
        runner = signer;
      } catch (error) {
        runner = provider
      }
      
      console.log("runner", runner);

      const Auction = new ethers.Contract(AuctionAddress, AuctionData.abi, runner) as unknown as Auction ;
      const DesalesNFT = new ethers.Contract(DesalesNFTAddress, DesalesNFTData.abi, runner)  as unknown as DesalesNFT ;
      const MockStableCoin = new ethers.Contract(MockStableCoinAddress, MockStableCoinData.abi, runner)  as unknown as MockStableCoin;

      setContracts({
        Auction,
        DesalesNFT,
        MockStableCoin,
      });
    }

    fetchContracts();
    //@ts-ignore
  }, [account.address, currentChainId]);

  if (!contracts) {
    return <LoadingComponent/>;
  }

  return (
    <ContractContext.Provider value={contracts}>{children}</ContractContext.Provider>
  );
}
