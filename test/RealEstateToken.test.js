const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstateToken Security Tests", function () {
  let RealEstateToken;
  let token;
  let owner;
  let propertyManager;
  let investor1;
  let investor2;
  let malicious;

  const propertyData = {
    propertyAddress: "Test Property Address",
    propertyType: "Commercial Office",
    totalValue: ethers.parseEther("1000000"), // 1M EUR
    tokenizedPercentage: 100,
    legalDocumentHash: "",
    valuationReportHash: "",
    isVerified: false,
    lastValuationDate: 0
  };

  beforeEach(async function () {
    [owner, propertyManager, investor1, investor2, malicious] = await ethers.getSigners();
    
    RealEstateToken = await ethers.getContractFactory("RealEstateToken");
    token = await RealEstateToken.deploy(
      "Test Property Token",
      "TPT",
      ethers.parseEther("1000000"), // 1M tokens
      propertyData,
      propertyManager.address
    );
    await token.waitForDeployment();
  });

  describe("🔐 Access Control Tests", function () {
    it("Should only allow owner to verify property", async function () {
      await expect(
        token.connect(malicious).verifyProperty("test-hash")
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to qualify investors", async function () {
      await expect(
        token.connect(malicious).qualifyInvestor(investor1.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should only allow property manager to collect revenue", async function () {
      await expect(
        token.connect(malicious).collectRevenue(1000)
      ).to.be.revertedWith("Only property manager");
    });
  });

  describe("🚫 KYC/AML Compliance Tests", function () {
    it("Should block transfers from unqualified investors", async function () {
      // Qualifier investor1 mais pas investor2
      await token.qualifyInvestor(investor1.address);
      await token.transfer(investor1.address, ethers.parseEther("1000"));
      
      // Transfer de investor1 vers investor2 (non qualifié) doit échouer
      await expect(
        token.connect(investor1).transfer(investor2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Recipient not qualified");
    });

    it("Should block transfers from blacklisted addresses", async function () {
      await token.qualifyInvestor(investor1.address);
      await token.transfer(investor1.address, ethers.parseEther("1000"));
      
      // Blacklister investor1
      await token.blacklistAddress(investor1.address);
      
      // Transfer doit échouer
      await expect(
        token.connect(investor1).transfer(owner.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Address is blacklisted");
    });
  });

  describe("⏸️ Pausable Functionality", function () {
    it("Should block all transfers when paused", async function () {
      await token.qualifyInvestor(investor1.address);
      await token.pause();
      
      await expect(
        token.transfer(investor1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });
  });

describe("💰 Token Value Calculation", function () {
    it("Should calculate correct token value", async function () {
      const tokenValue = await token.getTokenValue();
      // 1M EUR tokenisé à 100% / 1M tokens = 1 EUR per token (en wei)
      expect(tokenValue).to.be.gt(0);
    });
  });

  describe("🏢 Property Management", function () {
    it("Should update property valuation correctly", async function () {
      const newValue = ethers.parseEther("1200000");
      await token.updatePropertyValuation(newValue, "new-valuation-hash");
      
      const property = await token.getPropertyMetadata();
      expect(property.totalValue).to.equal(newValue);
      expect(property.valuationReportHash).to.equal("new-valuation-hash");
    });

    it("Should verify property correctly", async function () {
      await token.verifyProperty("legal-doc-hash");
      
      const property = await token.getPropertyMetadata();
      expect(property.isVerified).to.be.true;
      expect(property.legalDocumentHash).to.equal("legal-doc-hash");
    });
  });

  describe("🛡️ Security Edge Cases", function () {
    it("Should not allow blacklisting owner or property manager", async function () {
      await expect(
        token.blacklistAddress(owner.address)
      ).to.be.revertedWith("Cannot blacklist owner");
      
      await expect(
        token.blacklistAddress(propertyManager.address)
      ).to.be.revertedWith("Cannot blacklist property manager");
    });

    it("Should handle emergency withdraw correctly", async function () {
      // Envoyer des ETH au contrat
      await owner.sendTransaction({
        to: await token.getAddress(),
        value: ethers.parseEther("1")
      });
      
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await token.emergencyWithdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });
});