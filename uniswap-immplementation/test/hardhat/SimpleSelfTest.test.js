const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSelfTest", function () {
  let simpleSelfTest;
  let owner;
  let merchant;

  beforeEach(async function () {
    [owner, merchant] = await ethers.getSigners();
    
    const SimpleSelfTest = await ethers.getContractFactory("SimpleSelfTest");
    simpleSelfTest = await SimpleSelfTest.deploy();
    await simpleSelfTest.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await simpleSelfTest.getAddress()).to.be.properAddress;
  });

  it("Should allow owner to set verification status", async function () {
    const merchantAddress = merchant.address;
    const isVerified = true;
    
    await simpleSelfTest.setMerchantVerification(merchantAddress, isVerified);
    
    const verificationStatus = await simpleSelfTest.isMerchantVerified(merchantAddress);
    expect(verificationStatus).to.equal(isVerified);
  });

  it("Should not allow non-owner to set verification status", async function () {
    const merchantAddress = merchant.address;
    const isVerified = true;
    
    await expect(
      simpleSelfTest.connect(merchant).setMerchantVerification(merchantAddress, isVerified)
    ).to.be.revertedWithCustomError(simpleSelfTest, "OwnableUnauthorizedAccount");
  });

  it("Should emit MerchantVerified event", async function () {
    const merchantAddress = merchant.address;
    const isVerified = true;
    
    await expect(simpleSelfTest.setMerchantVerification(merchantAddress, isVerified))
      .to.emit(simpleSelfTest, "MerchantVerified")
      .withArgs(merchantAddress, isVerified);
  });
});
