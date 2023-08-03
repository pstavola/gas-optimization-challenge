// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const biddingTime = 24 * 60 * 60;//ONE_DAY_IN_SECS
  const signers = await hre.ethers.getSigners();
  const beneficiary = signers[1].address;

  const Auction = await hre.ethers.getContractFactory("SimpleAuction");
  const auction = await Auction.deploy(biddingTime, beneficiary);

  await auction.deployed();

  console.log(
    `Auction with bidding time ${biddingTime} seconds and beneficiary ${beneficiary} deployed to ${auction.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
