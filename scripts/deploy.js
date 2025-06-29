const hre = require("hardhat");

async function main() {
  console.log("🏢 Déploiement du contrat RealEstateToken...");
  
  // Paramètres de la propriété (FICTIVE POUR DÉMONSTRATION)
  const propertyData = {
    propertyAddress: "456 Rue de la Tokenisation, 75000 DemoVille, France [FICTIF]",
    propertyType: "Bureau Commercial - Propriété de Démonstration",
    totalValue: hre.ethers.parseEther("5000000"), // 5M EUR
    tokenizedPercentage: 80, // 80% tokenisé
    legalDocumentHash: "demo_legal_hash_001", // Hash de démonstration
    valuationReportHash: "demo_valuation_hash_001", // Hash de démonstration
    isVerified: false,
    lastValuationDate: 0
  };
  
  // Récupérer les signers
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  // Utiliser le même compte comme property manager pour simplifier
  const propertyManager = deployer;
  
  console.log("📋 Paramètres de déploiement:");
  console.log("- Deployer:", deployer.address);
  console.log("- Property Manager:", propertyManager.address);
  console.log("- Propriété:", propertyData.propertyAddress);
  console.log("- Valeur totale:", hre.ethers.formatEther(propertyData.totalValue), "EUR");
  console.log("- Pourcentage tokenisé:", propertyData.tokenizedPercentage + "%");
  
  // Vérifier le solde du deployer
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("- Solde deployer:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️ Attention: Solde faible, le déploiement pourrait échouer");
  }
  
  // Déploiement
  console.log("\n🚀 Déploiement en cours...");
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy(
    "DemoVille Office Token",       // nom
    "DVOT",                         // symbole  
    hre.ethers.parseEther("4000000"), // 4M tokens
    propertyData,                   // métadonnées
    propertyManager.address         // gestionnaire
  );

  console.log("⏳ Attente de la confirmation de déploiement...");
  await realEstateToken.waitForDeployment();
  
  const contractAddress = await realEstateToken.getAddress();
  
  console.log("\n✅ RealEstateToken déployé avec succès !");
  console.log("📝 Adresse du contrat:", contractAddress);
  console.log("🔗 Voir sur Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Vérifications post-déploiement
  console.log("\n🔍 Vérifications:");
  try {
    console.log("- Nom:", await realEstateToken.name());
    console.log("- Symbole:", await realEstateToken.symbol());
    console.log("- Supply total:", hre.ethers.formatEther(await realEstateToken.totalSupply()));
    console.log("- Valeur par token:", hre.ethers.formatEther(await realEstateToken.getTokenValue()), "EUR");
    
    const property = await realEstateToken.getPropertyMetadata();
    console.log("- Propriété vérifiée:", property.isVerified);
    console.log("- Valeur totale:", hre.ethers.formatEther(property.totalValue), "EUR");
  } catch (error) {
    console.log("⚠️ Erreur lors des vérifications:", error.message);
  }
  
  // Vérification Etherscan (seulement si on a une API key)
  if (process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY !== "your_etherscan_api_key_here") {
    console.log("\n⏳ Attente de 6 confirmations pour la vérification Etherscan...");
    await realEstateToken.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          "DemoVille Office Token",
          "DVOT",
          hre.ethers.parseEther("4000000"),
          propertyData,
          propertyManager.address
        ],
      });
      console.log("✅ Contrat vérifié sur Etherscan");
    } catch (error) {
      console.log("⚠️ Erreur de vérification Etherscan:", error.message);
      console.log("   Vous pouvez vérifier manuellement sur https://sepolia.etherscan.io");
    }
  } else {
    console.log("\n💡 Pour vérifier automatiquement sur Etherscan, ajoutez ETHERSCAN_API_KEY dans .env");
  }
  
  console.log("\n🎉 Déploiement terminé avec succès!");
  console.log("📝 Adresse du contrat:", contractAddress);
  console.log("🔗 Explorer:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Coût du déploiement
  const newBalance = await hre.ethers.provider.getBalance(deployer.address);
  const deploymentCost = balance - newBalance;
  console.log("💰 Coût du déploiement:", hre.ethers.formatEther(deploymentCost), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur de déploiement:", error);
    process.exit(1);
  });