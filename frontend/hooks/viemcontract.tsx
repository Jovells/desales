import { createPublicClient, http } from 'viem'
import { telosTestnet } from 'viem/chains'
import { getContract } from 'viem'
import { abi } from './abi'
import { createWalletClient, custom } from 'viem'


const walletClient = createWalletClient({
  chain: telosTestnet,
  transport: custom(window.ethereum)
})

export const publicClient = createPublicClient({
  chain: telosTestnet,
  transport: http(),
})

// 1. Create contract instance
export const viemAuction = getContract({
  address: '0x0aDa7CfA69Add88C2BF2B2e15979A4d509Deaa1A',
  abi: abi,
  walletClient,
  publicClient
})

