const hre = require("hardhat");

async function main() {
  // Adresse de votre contrat déployé
  const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
  
  console.log("🏢 Interaction avec RealEstateToken sur Sepolia");
  console.log("📝 Adresse du contrat:", CONTRACT_ADDRESS);
  
  // Se connecter au contrat
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const contract = RealEstateToken.attach(CONTRACT_ADDRESS);
  
  // Récupérer les signers
  const [owner, investor1, investor2] = await hre.ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("💼 Investor1:", investor1.address);
  console.log("💼 Investor2:", investor2.address);
  
  try {
    // 1. Lire les informations de base
    console.log("\n📊 INFORMATIONS DU TOKEN");
    console.log("- Nom:", await contract.name());
    console.log("- Symbole:", await contract.symbol());
    console.log("- Supply total:", hre.ethers.formatEther(await contract.totalSupply()));
    console.log("- Valeur par token:", hre.ethers.formatEther(await contract.getTokenValue()), "EUR");
    
    // 2. Lire les métadonnées de la propriété
    console.log("\n🏢 MÉTADONNÉES DE LA PROPRIÉTÉ");
    const property = await contract.getPropertyMetadata();
    console.log("- Adresse:", property.propertyAddress);
    console.log("- Type:", property.propertyType);
    console.log("- Valeur totale:", hre.ethers.formatEther(property.totalValue), "EUR");
    console.log("- Pourcentage tokenisé:", property.tokenizedPercentage.toString() + "%");
    console.log("- Vérifié:", property.isVerified);
    
    // 3. Balances des wallets
    console.log("\n💰 BALANCES");
    console.log("- Owner:", hre.ethers.formatEther(await contract.balanceOf(owner.address)));
    console.log("- Investor1:", hre.ethers.formatEther(await contract.balanceOf(investor1.address)));
    console.log("- Investor2:", hre.ethers.formatEther(await contract.balanceOf(investor2.address)));
    
    // 4. Statuts des investisseurs
    console.log("\n👥 STATUTS KYC");
    console.log("- Owner qualifié:", await contract.qualifiedInvestors(owner.address));
    console.log("- Investor1 qualifié:", await contract.qualifiedInvestors(investor1.address));
    console.log("- Investor2 qualifié:", await contract.qualifiedInvestors(investor2.address));
    
  } catch (error) {
    console.error("❌ Erreur lors de la lecture:", error.message);
  }
}

// Fonction pour qualifier un investisseur
async function qualifyInvestor(investorAddress) {
  const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const contract = RealEstateToken.attach(CONTRACT_ADDRESS);
  
  console.log(`🔐 Qualification de l'investisseur: ${investorAddress}`);
  
  try {
    const tx = await contract.qualifyInvestor(investorAddress);
    console.log("⏳ Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Investisseur qualifié avec succès!");
    console.log("🔗 Voir sur Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la qualification:", error.message);
  }
}

// Fonction pour transférer des tokens
async function transferTokens(toAddress, amount) {
  const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const contract = RealEstateToken.attach(CONTRACT_ADDRESS);
  
  console.log(`💸 Transfert de ${amount} tokens vers ${toAddress}`);
  
  try {
    const tx = await contract.transfer(toAddress, hre.ethers.parseEther(amount));
    console.log("⏳ Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transfert réussi!");
    console.log("🔗 Voir sur Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("❌ Erreur lors du transfert:", error.message);
  }
}

// Fonction pour mettre à jour la valorisation
async function updateValuation(newValue, reportHash) {
  const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const contract = RealEstateToken.attach(CONTRACT_ADDRESS);
  
  console.log(`📈 Mise à jour de la valorisation: ${newValue} EUR`);
  
  try {
    const tx = await contract.updatePropertyValuation(
      hre.ethers.parseEther(newValue),
      reportHash
    );
    console.log("⏳ Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Valorisation mise à jour!");
    console.log("🔗 Voir sur Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error.message);
  }
}

// Export des fonctions
module.exports = {
  main,
  qualifyInvestor,
  transferTokens,
  updateValuation
};

// Exécution si script appelé directement
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}