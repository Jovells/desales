# Desales: Decentralized Auctions Marketplace

Desales is a decentralized auctions marketplace project built with Hardhat and Next.js.

## Overview

Desales aims to provide a decentralized platform for conducting auctions. Users can participate in auctions using blockchain technology, ensuring transparency and security.

# Desales: Decentralized Auctions Marketplace

Desales is a decentralized auctions marketplace where users can create, bid on, and participate in auctions for unique NFTs. The platform leverages blockchain technology, IPFS storage, and smart contracts to ensure transparency, security, and a seamless auction experience.

## How it Works

### Creating an Auction

1. **Auction Configuration:**
   - Set the start and end times for the auction.
   - Choose the stablecoin for pricing the NFT.
   - Optionally enable the anti-sniping switch to prevent last-minute bidding overtaking the last bidder.
  
2. **Mint NFT:**
   - Mint an NFT which will be stored in the associated smart contract.
  
3. **IPFS Storage:**
   - Details of the auction and the minted NFT are uploaded to IPFS storage for decentralized and tamper-resistant storage.



### Bidding on an Auction

1. **Visit Auction Listing:**
   - Users can explore the auction listings to find NFTs they are interested in.

2. **Place a Bid:**
   - Users can place a bid on an auction, transferring the selected stablecoin to the smart contract.

3. **Refunding Last Bidder:**
   - If a higher bid is placed before the auction ends, the last bidder is automatically refunded.

3. **Sniping Prvention:**
   - If a bid is placed within last ten minutes of auction, 10 minutes is added to end time of auction.

### Claiming the NFT

1. **Winning Bidder:**
   - After the auction ends, the highest bidder can click a button to claim the NFT.

2. **NFT Transfer:**
   - The NFT is transferred from the smart contract to the winner's wallet.

### Transferring Funds (For Auctioneer)

1. **Claiming Funds:**
   - The auctioneer can click a button after the auction ends to initiate the transfer of funds from the smart contract to their wallet.


## Prerequisites

Make sure you have the following prerequisites before getting started:
- Node.js and npm installed
- Obtain NFTStorage API key from [NFTStorage](https://nft.storage/)
- Obtain Alchemy API key from [Alchemy](https://www.alchemy.com/)

## Environment Variables
Set the following environment variables in your project:

NEXT_PUBLIC_NFT_STORAGE_API_KEY: Obtain from nft.storage.
PRIVATE_KEY: Your private key.
ALCHEMY_API_KEY: Obtain from Alchemy.com.
Create a .env.local file inside the /frontend directory and a .env file in the project root. Populate them with the corresponding API keys.


## Getting Started

To set up the project locally, follow these steps:

### Setting Up Hardhat

```bash
# Install dependencies
npm install
```

**Deploy the smart contracts:**
```bash
npx hardhat run scripts/deploy.js
```

### Setting Up Next.js

**Navigate to the /frontend directory**
```bash
cd frontend
```

**Install dependencies**
```bash
npm install
```

Running Tests

**Run tests for contracts**
```bash
npx hardhat test
```





