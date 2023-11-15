import { ethers } from "hardhat";

export let _AuctionAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export let _DesalesNFTAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
export let _MockStableCoinAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

async function main() {

  const MockStableCoin = await ethers.deployContract("MockStableCoin");
  MockStableCoin.waitForDeployment();
  _MockStableCoinAddress = MockStableCoin.target as string;
  console.log(
    `MockStableCoin deployed to ${MockStableCoin.target}`
  );
  const Auction = await ethers.deployContract("Auction", ["0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363"]);

  await Auction.waitForDeployment();
  _AuctionAddress = Auction.target as string;


  console.log(
    `Auction deployed to ${Auction.target}`
  );
  const DesalesNFT = await ethers.deployContract("DesalesNFT", [Auction.target]);
  await DesalesNFT.waitForDeployment();
  _DesalesNFTAddress = DesalesNFT.target as string;
  console.log(
    `DesalesNFT deployed to ${DesalesNFT.target}`
  );
  Auction.setDnftAddress(DesalesNFT.target)
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
