import { network } from "hardhat";

async function main() {
  // Hardhat 3 style: Create connection to the selected network
  const { ethers } = await network.create();
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Card NFT
  const card = await ethers.deployContract("RitualTCGCard", [
    deployer.address, 
    "https://ritual-tcg.vercel.app/api/metadata/" // Placeholder base URI
  ]);
  await card.waitForDeployment();
  const cardAddress = await card.getAddress();
  console.log("RitualTCGCard deployed to:", cardAddress);

  // Deploy Marketplace
  const marketplace = await ethers.deployContract("RitualTCGMarketplace", [deployer.address, deployer.address]);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("RitualTCGMarketplace deployed to:", marketplaceAddress);

  console.log("\nDeployment completed!");
  console.log("-------------------");
  console.log("NFT_ADDRESS=" + cardAddress);
  console.log("MARKETPLACE_ADDRESS=" + marketplaceAddress);
  console.log("\nACTION REQUIRED: Update src/lib/config.ts with these addresses!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
