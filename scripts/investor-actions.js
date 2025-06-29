const hre = require("hardhat");
const { qualifyInvestor, transferTokens, updateValuation } = require('./interact.js');

/**
 * Script pour simuler des actions d'investisseurs
 * Usage: npx hardhat run scripts/investor-actions.js --network sepolia
 */

async function simulateInvestorFlow() {
  console.log("🎭 SIMULATION D'UN FLUX D'INVESTISSEURS");
  console.log("=====================================");
  
  const [owner, investor1, investor2, investor3] = await hre.ethers.getSigners();
  
  console.log("👥 Participants:");
  console.log("- Owner (Propriétaire):", owner.address);
  console.log("- Investor 1:", investor1.address);
  console.log("- Investor 2:", investor2.address);
  console.log("- Investor 3:", investor3.address);
  
  try {
    // Étape 1: Qualifier les investisseurs (processus KYC)
    console.log("\n📋 ÉTAPE 1: QUALIFICATION KYC DES INVESTISSEURS");
    await qualifyInvestor(investor1.address);
    await sleep(2000); // Attendre entre les transactions
    
    await qualifyInvestor(investor2.address);
    await sleep(2000);
    
    // Étape 2: Vente initiale de tokens aux investisseurs
    console.log("\n💰 ÉTAPE 2: VENTE INITIALE DE TOKENS");
    
    // Vendre 1000 tokens à investor1 (équivalent à 1000 EUR de l'immeuble)
    await transferTokens(investor1.address, "1000");
    await sleep(2000);
    
    // Vendre 500 tokens à investor2
    await transferTokens(investor2.address, "500");
    await sleep(2000);
    
    // Étape 3: Transfer secondaire entre investisseurs
    console.log("\n🔄 ÉTAPE 3: MARCHÉ SECONDAIRE");
    console.log("Investor1 vend 100 tokens à Investor2...");
    
    const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
    const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
    const contract = RealEstateToken.attach(CONTRACT_ADDRESS);
    
    // Connecter avec investor1 et transférer vers investor2
    const contractAsInvestor1 = contract.connect(investor1);
    const tx = await contractAsInvestor1.transfer(
      investor2.address, 
      hre.ethers.parseEther("100")
    );
    console.log("⏳ Transaction de transfert:", tx.hash);
    await tx.wait();
    console.log("✅ Transfert secondaire réussi!");
    
    await sleep(2000);
    
    // Étape 4: Tentative de transfert vers un investisseur non qualifié
    console.log("\n🚫 ÉTAPE 4: TEST DE CONFORMITÉ KYC");
    console.log("Tentative de transfert vers un investisseur non qualifié...");
    
    try {
      await contractAsInvestor1.transfer(
        investor3.address, 
        hre.ethers.parseEther("50")
      );
    } catch (error) {
      console.log("❌ Transfert bloqué (normal):", error.reason || error.message);
    }
    
    // Étape 5: Mise à jour de la valorisation
    console.log("\n📈 ÉTAPE 5: RÉÉVALUATION DE LA PROPRIÉTÉ");
    await updateValuation("5500000", "QmNewValuationReport2024");
    
    // Étape 6: Affichage des résultats finaux
    console.log("\n📊 RÉSULTATS FINAUX");
    console.log("- Owner balance:", hre.ethers.formatEther(await contract.balanceOf(owner.address)));
    console.log("- Investor1 balance:", hre.ethers.formatEther(await contract.balanceOf(investor1.address)));
    console.log("- Investor2 balance:", hre.ethers.formatEther(await contract.balanceOf(investor2.address)));
    console.log("- Investor3 balance:", hre.ethers.formatEther(await contract.balanceOf(investor3.address)));
    
    const newTokenValue = await contract.getTokenValue();
    console.log("- Nouvelle valeur par token:", hre.ethers.formatEther(newTokenValue), "EUR");
    
    console.log("\n🎉 SIMULATION TERMINÉE AVEC SUCCÈS!");
    
  } catch (error) {
    console.error("❌ Erreur dans la simulation:", error.message);
  }
}

// Fonction pour acheter des tokens (pour un investisseur)
async function buyTokens(investorIndex, amount) {
  console.log(`💰 Achat de ${amount} tokens par l'investisseur ${investorIndex}`);
  
  const signers = await hre.ethers.getSigners();
  const investor = signers[investorIndex];
  
  // D'abord qualifier l'investisseur si nécessaire
  await qualifyInvestor(investor.address);
  await sleep(2000);
  
  // Puis transférer les tokens
  await transferTokens(investor.address, amount);
}

// Fonction pour vendre des tokens (transfert vers un autre investisseur)
async function sellTokens(fromInvestorIndex, toInvestorIndex, amount) {
  console.log(`💸 Vente de ${amount} tokens de l'investisseur ${fromInvestorIndex} vers ${toInvestorIndex}`);
  
  const signers = await hre.ethers.getSigners();
  const fromInvestor = signers[fromInvestorIndex];
  const toInvestor = signers[toInvestorIndex];
  
  const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const contract = RealEstateToken.attach(CONTRACT_ADDRESS);
  
  try {
    // S'assurer que le destinataire est qualifié
    await qualifyInvestor(toInvestor.address);
    await sleep(2000);
    
    // Effectuer le transfert
    const contractAsSeller = contract.connect(fromInvestor);
    const tx = await contractAsSeller.transfer(
      toInvestor.address, 
      hre.ethers.parseEther(amount)
    );
    
    console.log("⏳ Transaction envoyée:", tx.hash);
    await tx.wait();
    console.log("✅ Vente réussie!");
    console.log("🔗 Voir sur Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la vente:", error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export des fonctions
module.exports = {
  simulateInvestorFlow,
  buyTokens,
  sellTokens
};

// Script principal
if (require.main === module) {
  const action = process.argv[2];
  
  switch(action) {
    case 'simulate':
      simulateInvestorFlow()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'buy':
      const investorIndex = parseInt(process.argv[3]) || 1;
      const buyAmount = process.argv[4] || "100";
      buyTokens(investorIndex, buyAmount)
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'sell':
      const fromIndex = parseInt(process.argv[3]) || 1;
      const toIndex = parseInt(process.argv[4]) || 2;
      const sellAmount = process.argv[5] || "50";
      sellTokens(fromIndex, toIndex, sellAmount)
        .then(() => process.exit(0))
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    default:
      console.log("Usage:");
      console.log("- npx hardhat run scripts/investor-actions.js simulate --network sepolia");
      console.log("- npx hardhat run scripts/investor-actions.js buy [investorIndex] [amount] --network sepolia");
      console.log("- npx hardhat run scripts/investor-actions.js sell [fromIndex] [toIndex] [amount] --network sepolia");
  }
}