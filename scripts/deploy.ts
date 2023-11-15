import { ethers } from "hardhat";

async function main() {

  const MockStableCoin = await ethers.deployContract("MockStableCoin");
  MockStableCoin.waitForDeployment();
  console.log(
    `MockStableCoin deployed to ${MockStableCoin.target}`
  );
  const Auction = await ethers.deployContract("Auction", ["0x22e5768fD06A7FB86fbB928Ca14e9D395f7C5363"]);

  await Auction.waitForDeployment();


  console.log(
    `Auction deployed to ${Auction.target}`
  );
  const DesalesNFT = await ethers.deployContract("DesalesNFT", [Auction.target]);
  await DesalesNFT.waitForDeployment();
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
