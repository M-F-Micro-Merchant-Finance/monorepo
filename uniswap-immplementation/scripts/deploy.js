const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SimpleSelfTest...");

  const SimpleSelfTest = await ethers.getContractFactory("SimpleSelfTest");
  const simpleSelfTest = await SimpleSelfTest.deploy();
  
  await simpleSelfTest.waitForDeployment();
  
  const address = await simpleSelfTest.getAddress();
  console.log("SimpleSelfTest deployed to:", address);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
