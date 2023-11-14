import { expect } from "chai";
import { ethers } from "hardhat";
import { Auction, DesalesNFT, Stablecoin } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";


describe("Auction", function () {
const FUTURE_DATE = Math.floor(new Date(Date.now() + 7 * 24 * 60 * 60).getTime() / 1000)*2;
  let auction: Auction,
    dnft: DesalesNFT,
    stablecoin: Stablecoin,
    owner: SignerWithAddress,
    seller: SignerWithAddress,
    bidder1: SignerWithAddress,
    bidder2: SignerWithAddress,
    tokenId: bigint;

      beforeEach(async function () {
        [owner, seller, bidder1, bidder2] = await ethers.getSigners();

        const Stablecoin = await ethers.getContractFactory("Stablecoin");
        stablecoin = (await Stablecoin.deploy()) as Stablecoin;
        
        stablecoin.connect(owner).transfer(bidder1.address, 100000);
        stablecoin.connect(owner).transfer(bidder2.address, 100000);
        
        const Auction = await ethers.getContractFactory("Auction");
        auction = (await Auction.deploy('0x0000000000000000000000000000000000000000')) as Auction;
        
        const DNFT = await ethers.getContractFactory("DesalesNFT");
        dnft = (await DNFT.deploy(auction.target)) as DesalesNFT;

        await auction.connect(owner).setDnftAddress(dnft.target);
      
      });

      describe("createAuction", function () {
        it("should allow a user to create an auction", async function () {

          const startTime = BigInt(Math.floor(Date.now() / 1000));
          
            
          const tx = await auction.connect(seller)
            .createAuction(stablecoin.target, startTime, FUTURE_DATE, 10, 'ipgg.com', true, { gasLimit: 3e7 });
        const receipt = await tx.wait();
        const auctionId = await auction.auctionCount();
        tokenId = auctionId;




          // Assert that the auction was created
          expect(await auction.getAuction(auctionId)).to.deep.equal([
            seller.address,
            stablecoin.target,
            startTime,
            FUTURE_DATE,
            10n,
            ethers.ZeroAddress,
            0n,
            tokenId,
            dnft.target,
            false,
            false,
            true
          ]);
        });
      });

      describe("Bidding", function () {
        let auctionId: bigint;
        beforeEach(async function () {
          //get current block time from evm
          const block = await ethers.provider.getBlock("latest");
            
            const startTime = block!.timestamp;
            const tx = await auction.connect(seller)
            .createAuction(stablecoin.target, startTime, block!.timestamp +FUTURE_DATE, 10, "ghh", true, { gasLimit: 3e7 });
        const receipt = await tx.wait();
        auctionId = await auction.auctionCount();

        });
        it("should allow users to place bids", async function () {
          // Approve the auction contract to transfer stablecoin on behalf of bidder1
          await stablecoin.connect(bidder1).approve(auction.target, 100);

          //check balance before
            const bidder1BalanceBefore = await stablecoin.balanceOf(bidder1.address)

          // Place a bid on the auction
          await auction.connect(bidder1).placeBid(auctionId, 100, { gasLimit: 3e7 });

            //check balance after
            const bidder1BalanceAfter = await stablecoin.balanceOf(bidder1.address)

        //Assert that the bidder1 was deducted the bid amount
        expect(bidder1BalanceAfter).to.equal(bidder1BalanceBefore- 100n);

          // Assert that the highest bid is now 100
          expect((await auction.getAuction(auctionId)).highestBid).to.equal(100);
        });

        it("should refund the previous highest bidder", async function () {
          // Approve the auction contract to transfer stablecoin on behalf of bidder1 and bidder2
          await stablecoin.connect(bidder1).approve(auction.target, 100);
          await stablecoin.connect(bidder2).approve(auction.target, 200);

          //check balance
          const bidder1BalanceBefore = await stablecoin.balanceOf(bidder1.address)

          // Place a bid on the auction
          await auction.connect(bidder1).placeBid(auctionId, 100);


          // Place a higher bid on the auction
          await auction.connect(bidder2).placeBid(auctionId, 200);

          // Assert that bidder1 was refunded their bid amount
          expect(await stablecoin.balanceOf(bidder1.address)).to.equal(bidder1BalanceBefore);
        });

        it("should revert if the bid is not higher than the current highest bid", async function () {
          // Approve the auction contract to transfer stablecoin on behalf of bidder1
          await stablecoin.connect(bidder1).approve(auction.target, 100);

          // Place a bid on the auction
          await auction.connect(bidder1).placeBid(auctionId, 100);

          // Attempt to place a lower bid on the auction
          await expect(auction.connect(bidder2).placeBid(auctionId, 50)).to.be.revertedWith(
            "Bid must be higher than the current highest bid",
          );
        });
      });

      describe("claim & Withdraw", function () {
        let auctionId: bigint;

        beforeEach(async function () {
        
            const block = await ethers.provider.getBlock("latest");
            const timestamp = block!.timestamp;
          const startTime = 0;
          const endTime = timestamp+1000;

        await ethers.provider.send("evm_setNextBlockTimestamp", [endTime+1000]);
      
          const tx = await auction.connect(seller)
          .createAuction(stablecoin.target, startTime, endTime+1500, 10, 'ghggh', true, { gasLimit: 3e7 });
            const receipt = await tx.wait();
            auctionId = await auction.auctionCount();

          await stablecoin.connect(bidder1).approve(auction.target, 100);
          await stablecoin.connect(bidder2).approve(auction.target, 200);
          // Place a bid on the auction
          await auction.connect(bidder1).placeBid(auctionId, 100, { gasLimit: 3e7 });
          // Place a higher bid on the auction
          await auction.connect(bidder2).placeBid(auctionId, 200, { gasLimit: 3e7 });

          const afterBlock = await ethers.provider.getBlock("latest");
          

          await ethers.provider.send("evm_setNextBlockTimestamp", [afterBlock!.timestamp + endTime]);


        });
        it("should allow the highest bidder to claim the DNFT", async function () {
          // Approve the auction contract to transfer the DNFT on behalf of the seller
          await dnft.connect(seller).setApprovalForAll(auction.target, true);


          // End the auction and claim the DNFT
          await auction.connect(bidder2).claim(auctionId, { gasLimit: 3e7 });

          // Assert that the DNFT is now owned by bidder1
          expect(await dnft.ownerOf(tokenId)).to.equal(bidder2.address);
        });

        it("should revert if the caller is not the highest bidder", async function () {
          // Approve the auction contract to transfer the DNFT on behalf of the seller
          await dnft.connect(seller).setApprovalForAll(auction.target, true);

          // Attempt to claim the DNFT as bidder2
          await expect(auction.connect(bidder1).claim(0)).to.be.revertedWith("Only the highest bidder can claim");
        });

        it("should allow the seller to withdraw the highest bid", async function () {
    
          // End the auction and withdraw the highest bid
          await auction.connect(seller).withdraw(auctionId);

          // Assert that the seller received the highest bid amount
          expect(await stablecoin.balanceOf(seller.address)).to.equal(200);
        });

        it("should revert if there are no funds to withdraw", async function () {
          // Approve the auction contract to transfer the DNFT on behalf of the seller
          await dnft.connect(seller).setApprovalForAll(auction.target, true);
          await auction.connect(seller).withdraw(auctionId);

          // End the auction and attempt to withdraw the highest bid
          await expect(auction.connect(seller).withdraw(auctionId)).to.be.revertedWith("Funds already withdrawn");
        });
      });
  describe("Sniping prevention", function(){
    let auctionId: bigint;
    let endtime : number;
    //ensures that end time is increased when bid is placed with last 5 minutes
    beforeEach(async function () {
      const startTime = 0;
      const block = await ethers.provider.getBlock("latest"); 
      endtime = block!.timestamp + 60*60*24;
      const tx = await auction.connect(seller).createAuction(stablecoin.target, startTime, endtime, 10, "ghh", true, { gasLimit: 3e7 });
      const receipt = await tx.wait();
      auctionId = await auction.auctionCount()
      console.log('auctionId',auctionId)
    })
    it("should increase end time when bid is placed with last 5 minutes", async function () {
      console.log('beforeevm', endtime)
      const fiveminutes = 5 * 60;
      // await ethers.provider.send("evm_setNextBlockTimestamp", [endtime-fiveminutes]);
      // console.log('aftereEvm', fiveminutes)

      // Approve the auction contract to transfer stablecoin on behalf of bidder1
      await stablecoin.connect(bidder2).approve(auction.target, 100);

      const tx = await auction.connect(bidder2).placeBid(auctionId, 11, { gasLimit: 3e7 });
      console.log('aftereBid', tx)
      
      const auctionEndTime = (await auction.getAuction(auctionId)).endTime;
      console.log('auctionEndTime',auctionEndTime)
      expect (tx).to.emit(auction, 'bidPlaced').withArgs(auctionId, bidder1.address, 100, endtime-fiveminutes);
      expect(auctionEndTime).to.equal(auctionEndTime);
})
})
});