// Configuration
const CONTRACT_ADDRESS = "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619";
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 en hex

// ABI du contrat (simplifié)
const CONTRACT_ABI = [
    // Read functions
    "function name() view returns (string)",
    "function symbol() view returns (string)", 
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function getTokenValue() view returns (uint256)",
    "function getPropertyMetadata() view returns (tuple(string propertyAddress, string propertyType, uint256 totalValue, uint256 tokenizedPercentage, string legalDocumentHash, string valuationReportHash, bool isVerified, uint256 lastValuationDate))",
    "function qualifiedInvestors(address) view returns (bool)",
    "function blacklisted(address) view returns (bool)",
    "function owner() view returns (address)",
    "function propertyManager() view returns (address)",
    "function totalRevenueCollected() view returns (uint256)",
    "function totalRevenueDistributed() view returns (uint256)",
    
    // Write functions
    "function qualifyInvestor(address investor)",
    "function disqualifyInvestor(address investor)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function updatePropertyValuation(uint256 newValue, string valuationHash)",
    "function verifyProperty(string documentHash)",
    "function collectRevenue(uint256 amount)",
    "function distributeDividends() payable",
    "function pause()",
    "function unpause()",
    "function blacklistAddress(address account)",
    "function whitelistAddress(address account)",
    
    // Events
    "event PropertyVerified(address indexed verifier, string documentHash)",
    "event PropertyUpdated(string newValuationHash, uint256 newValue)",
    "event InvestorQualified(address indexed investor)",
    "event RevenueCollected(uint256 amount)",
    "event DividendsDistributed(uint256 totalAmount, uint256 perToken)"
];

// Variables globales
let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

// Définir les fonctions globales AVANT DOMContentLoaded
console.log('📥 Chargement du script app.js...');

// Fonction globale de calcul
window.manuallyCalculateTokenValue = async function() {
    console.log('🔥 Fonction manuallyCalculateTokenValue appelée (globale)');
    
    if (!window.contract) {
        console.log('❌ Contract non disponible');
        alert('❌ Connectez-vous d\'abord');
        return;
    }

    console.log('✅ Contract disponible, début du calcul');

    try {
        console.log('🧮 Calcul de la valeur du token...');
        
        const [property, totalSupply, tokenValue] = await Promise.all([
            window.contract.getPropertyMetadata(),
            window.contract.totalSupply(),
            window.contract.getTokenValue()
        ]);

        const propertyValueEur = parseFloat(ethers.utils.formatEther(property.totalValue));
        const totalSupplyNum = parseFloat(ethers.utils.formatEther(totalSupply));
        const tokenizedPercentage = property.tokenizedPercentage;
        
        console.log('🔍 DONNÉES POUR CALCUL:');
        console.log('- Valeur propriété:', propertyValueEur, 'EUR');
        console.log('- % tokenisé:', tokenizedPercentage, '%');
        console.log('- Supply total:', totalSupplyNum, 'tokens');
        
        if (propertyValueEur > 0 && totalSupplyNum > 0 && tokenizedPercentage > 0) {
            const tokenizedValue = (propertyValueEur * tokenizedPercentage) / 100;
            const calculatedTokenValue = tokenizedValue / totalSupplyNum;
            
            // Mettre à jour l'affichage
            const tokenValueElement = document.getElementById('tokenValue');
            if (tokenValueElement) {
                tokenValueElement.textContent = '€' + calculatedTokenValue.toFixed(6);
            }
            
            console.log(`✅ Valeur calculée: €${calculatedTokenValue.toFixed(6)} par token`);
            alert(`✅ Valeur calculée: €${calculatedTokenValue.toFixed(6)} par token`);
            
        } else {
            console.log('❌ Impossible de calculer: données insuffisantes');
            alert('❌ Impossible de calculer: données insuffisantes');
        }

    } catch (error) {
        console.error('Erreur calcul:', error);
        alert('❌ Erreur: ' + error.message);
    }
};

// Fonction de test
window.testCalculateValue = function() {
    console.log('🧪 Test function called');
    window.manuallyCalculateTokenValue();
};

// Fonction pour attacher le bouton
window.attachCalculateButton = function() {
    const btn = document.getElementById('calculateTokenValueBtn');
    if (btn) {
        btn.onclick = window.manuallyCalculateTokenValue;
        console.log('✅ Event listener attaché manuellement');
        alert('✅ Bouton connecté!');
        return true;
    } else {
        console.log('❌ Bouton non trouvé');
        alert('❌ Bouton non trouvé');
        return false;
    }
};

console.log('✅ Fonctions globales définies');

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Interface RWA Token chargée');
    
    // Vérifier si ethers est chargé
    if (typeof ethers === 'undefined') {
        console.error('❌ Ethers.js non chargé');
        showMessage('❌ Erreur: Ethers.js non chargé. Vérifiez votre connexion internet.', 'error');
        return;
    }
    
    // Vérifier si MetaMask est installé
    if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask détecté');
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Vérifier si déjà connecté
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Erreur initialisation provider:', error);
            showMessage('❌ Erreur d\'initialisation du provider', 'error');
        }
    } else {
        console.log('❌ MetaMask non détecté');
        showMessage('❌ MetaMask non détecté. Veuillez installer MetaMask.', 'error');
    }
    
    // Event listeners
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('qualifyBtn').addEventListener('click', qualifyInvestor);
    document.getElementById('transferBtn').addEventListener('click', transferTokens);
    document.getElementById('updateValuationBtn').addEventListener('click', updateValuation);
    document.getElementById('verifyPropertyBtn').addEventListener('click', verifyProperty);
    document.getElementById('collectRevenueBtn').addEventListener('click', collectRevenue);
    document.getElementById('distributeDividendsBtn').addEventListener('click', distributeDividends);
    // Vérification et ajout de l'event listener pour autoDistributeBtn
    const autoDistributeBtn = document.getElementById('autoDistributeBtn');
    if (autoDistributeBtn) {
        autoDistributeBtn.addEventListener('click', autoDistributeDividends);
        console.log('✅ Event listener ajouté pour autoDistributeBtn');
    } else {
        console.log('❌ autoDistributeBtn non trouvé dans le DOM');
    }
    document.getElementById('showManualBtn').addEventListener('click', toggleManualDistribution);
    // Ajouter l'event listener avec un délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
        const calculateBtn = document.getElementById('calculateTokenValueBtn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔥 Bouton cliqué via event listener');
                manuallyCalculateTokenValue();
            });
            console.log('✅ Event listener ajouté au bouton calculer valeur');
            
            // Test direct
            calculateBtn.onclick = function() {
                console.log('🔥 Bouton cliqué via onclick');
                manuallyCalculateTokenValue();
            };
        } else {
            console.log('❌ Bouton calculateTokenValueBtn non trouvé');
        }
    }, 100);
    document.getElementById('pauseBtn').addEventListener('click', pauseContract);
    document.getElementById('unpauseBtn').addEventListener('click', unpauseContract);
});

// Connexion au wallet
async function connectWallet() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask non détecté');
        }
        
        // Demander la connexion
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Vérifier le réseau
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== SEPOLIA_CHAIN_ID) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    showMessage('❌ Veuillez ajouter le réseau Sepolia à MetaMask', 'error');
                    return;
                }
                throw switchError;
            }
        }
        
        // Initialiser provider et signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Initialiser le contrat
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        window.contract = contract; // Exposer globalement
        window.userAddress = userAddress; // Exposer l'adresse globalement
        
        // Mettre à jour l'UI
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('walletInfo').classList.remove('hidden');
        document.getElementById('walletAddress').textContent = userAddress;
        
        // Afficher la status bar et mettre à jour les indicateurs
        if (typeof statusBar !== 'undefined') {
            statusBar.show();
            statusBar.updateNetwork(true, 'Sepolia Testnet');
        }
        
        // Notification moderne
        if (typeof notifications !== 'undefined') {
            notifications.success('Connexion réussie', `Wallet connecté sur Sepolia: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`);
        } else {
            showMessage('✅ Wallet connecté avec succès!', 'success');
        }
        
        // Charger les données
        await loadContractData();
        
        // Attacher le bouton calculer valeur
        window.attachCalculateButton();
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showMessage(`❌ Erreur de connexion: ${error.message}`, 'error');
    }
}

// Charger les données du contrat
async function loadContractData() {
    if (!contract) return;
    
    try {
        console.log('📊 Chargement des données du contrat...');
        
        // Informations du token et métadonnées de la propriété
        const [name, symbol, totalSupply, tokenValue, myBalance, property] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.totalSupply(),
            contract.getTokenValue(),
            contract.balanceOf(userAddress),
            contract.getPropertyMetadata()
        ]);
        
        document.getElementById('tokenName').textContent = name;
        document.getElementById('tokenSymbol').textContent = symbol;
        document.getElementById('totalSupply').textContent = formatEther(totalSupply);
        
        // Calculer la valeur du token si elle est à 0
        let tokenValueEth = parseFloat(ethers.utils.formatEther(tokenValue));
        
        // Si la valeur du token est 0, calculer automatiquement
        if (tokenValueEth === 0) {
            console.log('🔍 Valeur token = 0, calcul automatique...');
            
            const propertyValueEth = parseFloat(ethers.utils.formatEther(property.totalValue));
            const totalSupplyNum = parseFloat(ethers.utils.formatEther(totalSupply));
            
            console.log('📊 Données pour calcul:');
            console.log('- Valeur propriété:', propertyValueEth, 'EUR');
            console.log('- % tokenisé:', property.tokenizedPercentage, '%');
            console.log('- Supply total:', totalSupplyNum, 'tokens');
            
            if (propertyValueEth > 0 && property.tokenizedPercentage > 0 && totalSupplyNum > 0) {
                const tokenizedValue = (propertyValueEth * property.tokenizedPercentage) / 100;
                tokenValueEth = tokenizedValue / totalSupplyNum;
                
                console.log('💡 Valeur calculée:', tokenValueEth, 'EUR par token');
                showMessage(`💡 Valeur calculée automatiquement: €${tokenValueEth.toFixed(6)} par token`, 'info');
            } else {
                console.log('❌ Impossible de calculer la valeur: données insuffisantes');
                showMessage('⚠️ Impossible de calculer la valeur du token: données de propriété manquantes', 'warning');
            }
        }
        
        document.getElementById('tokenValue').textContent = tokenValueEth > 0 ? 
            '€' + tokenValueEth.toFixed(6) : '0 EUR';
        document.getElementById('myBalance').textContent = formatEther(myBalance);
        // Override des données pour la démonstration (masquer les vraies adresses)
        const isDemoMode = window.isDemoMode ? window.isDemoMode() : true;
        
        if (isDemoMode) {
            const demoProperty = window.getDemoProperty ? window.getDemoProperty() : {
                address: "456 Rue de la Tokenisation, 75000 DemoVille, France [FICTIF]",
                type: "Bureau Commercial - Propriété de Démonstration"
            };
            
            document.getElementById('propertyAddress').textContent = demoProperty.address;
            document.getElementById('propertyType').textContent = demoProperty.type;
            
            // Notification pour expliquer le masquage
            if (typeof notifications !== 'undefined') {
                const disclaimerMsg = window.RWA_CONFIG?.DISCLAIMER?.notification || 
                    'Les vraies adresses de propriété sont masquées et remplacées par des données fictives pour cette démonstration.';
                notifications.info('Données masquées', disclaimerMsg, { 
                    duration: window.RWA_CONFIG?.UI?.disclaimerDuration || 6000 
                });
            }
        } else {
            document.getElementById('propertyAddress').textContent = property.propertyAddress;
            document.getElementById('propertyType').textContent = property.propertyType;
        }
        
        document.getElementById('propertyValue').textContent = formatEther(property.totalValue) + ' EUR';
        document.getElementById('tokenizedPercentage').textContent = property.tokenizedPercentage + '%';
        document.getElementById('isVerified').textContent = property.isVerified ? '✅ Oui' : '❌ Non';
        document.getElementById('isVerified').className = property.isVerified ? 'font-medium text-green-600' : 'font-medium text-red-600';
        
        // Statut KYC de l'utilisateur et vérification des rôles
        const [isQualified, owner, propertyManager] = await Promise.all([
            contract.qualifiedInvestors(userAddress),
            contract.owner(),
            contract.propertyManager()
        ]);
        
        const kycElement = document.getElementById('kycStatus');
        if (isQualified) {
            kycElement.textContent = '✅ Qualifié';
            kycElement.className = 'px-2 py-1 text-xs rounded bg-green-100 text-green-800';
        } else {
            kycElement.textContent = '❌ Non qualifié';
            kycElement.className = 'px-2 py-1 text-xs rounded bg-red-100 text-red-800';
        }
        
        // Déterminer les rôles de l'utilisateur
        const isOwner = userAddress.toLowerCase() === owner.toLowerCase();
        const isPropertyManager = userAddress.toLowerCase() === propertyManager.toLowerCase();
        
        // Mettre à jour la status bar
        if (typeof statusBar !== 'undefined') {
            statusBar.updateKYC(isQualified);
            statusBar.updateRole(isOwner, isPropertyManager);
            statusBar.updatePortfolio(parseFloat(ethers.utils.formatEther(myBalance)), parseFloat(ethers.utils.formatEther(myBalance)) * tokenValueEth);
        }
        
        // Adapter l'interface selon le rôle
        if (typeof adaptInterfaceForRole !== 'undefined') {
            adaptInterfaceForRole(isOwner, isPropertyManager, isQualified);
        }
        
        // Revenus et dividendes
        const [totalRevenue, totalDistributed] = await Promise.all([
            contract.totalRevenueCollected(),
            contract.totalRevenueDistributed()
        ]);
        
        const totalRevenueNumber = parseInt(totalRevenue.toString());
        const totalDistributedETH = parseFloat(formatEther(totalDistributed));
        
        document.getElementById('totalRevenue').textContent = totalRevenueNumber.toLocaleString('fr-FR') + ' EUR';
        document.getElementById('totalDistributed').textContent = formatEther(totalDistributed) + ' ETH';
        
        // Calculer les revenus en attente (non encore distribués)
        const pendingRevenueEUR = totalRevenueNumber; // Tous les revenus EUR sont "en attente" jusqu'à distribution ETH
        
        console.log('📊 DONNÉES REVENUS:');
        console.log('- Total revenus collectés (brut):', totalRevenue.toString());
        console.log('- Total revenus collectés (nombre):', totalRevenueNumber, 'EUR');
        console.log('- Total distribués (ETH):', totalDistributedETH, 'ETH');
        console.log('- Revenus en attente:', pendingRevenueEUR, 'EUR');
        
        document.getElementById('pendingRevenue').textContent = pendingRevenueEUR.toLocaleString('fr-FR') + ' EUR';
        
        // Calculer la part de l'utilisateur - CORRECTION BUG
        // Utiliser ethers.utils.formatEther au lieu de formatEther local
        const myBalanceNumber = parseFloat(ethers.utils.formatEther(myBalance));
        const totalSupplyNumber = parseFloat(ethers.utils.formatEther(totalSupply));
        const myPercentage = totalSupplyNumber > 0 ? (myBalanceNumber / totalSupplyNumber) * 100 : 0;
        const myRevenueShare = (pendingRevenueEUR * myPercentage) / 100;
        
        console.log('💰 CALCUL DES REVENUS:');
        console.log('- Mon balance (brut):', myBalance.toString());
        console.log('- Mon balance (formaté):', myBalanceNumber, 'tokens');
        console.log('- Total supply (brut):', totalSupply.toString());
        console.log('- Total supply (formaté):', totalSupplyNumber, 'tokens');
        console.log('- Mon pourcentage:', myPercentage.toFixed(4) + '%');
        console.log('- Revenus en attente:', pendingRevenueEUR, 'EUR');
        console.log('- Ma part des revenus:', myRevenueShare.toFixed(2), 'EUR');
        
        // Vérification des valeurs critiques
        if (myBalanceNumber === 0) {
            console.log('⚠️ ALERTE: Balance utilisateur = 0');
        }
        if (totalSupplyNumber === 0) {
            console.log('⚠️ ALERTE: Total supply = 0');
        }
        if (myPercentage === 0 && myBalanceNumber > 0) {
            console.log('⚠️ ALERTE: Pourcentage = 0 mais balance > 0 - Problème de calcul!');
        }
        
        document.getElementById('myTokenPercentage').textContent = myPercentage.toFixed(2) + '%';
        document.getElementById('myRevenueShare').textContent = myRevenueShare.toLocaleString('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }) + ' EUR';
        
        // Calculer distribution ETH suggérée - MONTANT FIXE POUR TESTS
        const fixedTestAmount = 0.01; // Montant fixe pour les tests (compatible avec balance testnet)
        const suggestedETHAmount = fixedTestAmount;
        const myETHShare = (suggestedETHAmount * myPercentage) / 100;
        
        document.getElementById('suggestedETH').textContent = suggestedETHAmount.toFixed(6) + ' ETH';
        document.getElementById('myETHShare').textContent = myETHShare.toFixed(6) + ' ETH';
        
        // Pré-remplir le champ de distribution manuelle
        document.getElementById('dividendAmount').value = suggestedETHAmount.toFixed(6);
        
        // Notification de succès avec statistiques
        if (typeof notifications !== 'undefined') {
            notifications.success('Données synchronisées', 
                `Propriété: ${formatCurrency(parseFloat(ethers.utils.formatEther(property.totalValue)))} • Tokens: ${formatTokens(parseFloat(ethers.utils.formatEther(myBalance)))} • Revenus: ${formatCurrency(pendingRevenueEUR)}`
            );
        } else {
            showMessage('✅ Données chargées avec succès', 'success');
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showMessage(`❌ Erreur de chargement: ${error.message}`, 'error');
    }
}

// Qualifier un investisseur
async function qualifyInvestor() {
    const address = document.getElementById('qualifyAddress').value;
    if (!address || !ethers.utils.isAddress(address)) {
        showMessage('❌ Adresse invalide', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Qualification en cours...', 'info');
        const tx = await contract.qualifyInvestor(address);
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Investisseur qualifié avec succès!', 'success');
        document.getElementById('qualifyAddress').value = '';
        
        // Recharger les données si c'est l'utilisateur actuel
        if (address.toLowerCase() === userAddress.toLowerCase()) {
            await loadContractData();
        }
        
    } catch (error) {
        console.error('Erreur qualification:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Transférer des tokens
async function transferTokens() {
    const to = document.getElementById('transferTo').value;
    const amount = document.getElementById('transferAmount').value;
    
    if (!to || !ethers.utils.isAddress(to)) {
        showMessage('❌ Adresse destinataire invalide', 'error');
        return;
    }
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showMessage('❌ Montant invalide', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Transfert en cours...', 'info');
        const tx = await contract.transfer(to, ethers.utils.parseEther(amount));
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Transfert réussi!', 'success');
        
        // Vider les champs
        document.getElementById('transferTo').value = '';
        document.getElementById('transferAmount').value = '';
        
        // Recharger les données
        await loadContractData();
        
    } catch (error) {
        console.error('Erreur transfert:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Mettre à jour la valorisation
async function updateValuation() {
    const newValue = document.getElementById('newValuation').value;
    const hash = document.getElementById('valuationHash').value;
    
    if (!newValue || isNaN(newValue) || parseFloat(newValue) <= 0) {
        showMessage('❌ Nouvelle valorisation invalide', 'error');
        return;
    }
    
    if (!hash) {
        showMessage('❌ Hash du rapport requis', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Mise à jour en cours...', 'info');
        const tx = await contract.updatePropertyValuation(
            ethers.utils.parseEther(newValue),
            hash
        );
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Valorisation mise à jour!', 'success');
        
        // Vider les champs
        document.getElementById('newValuation').value = '';
        document.getElementById('valuationHash').value = '';
        
        // Recharger les données
        await loadContractData();
        
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Vérifier la propriété
async function verifyProperty() {
    const hash = document.getElementById('verificationHash').value;
    
    if (!hash) {
        showMessage('❌ Hash des documents requis', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Vérification en cours...', 'info');
        const tx = await contract.verifyProperty(hash);
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Propriété vérifiée!', 'success');
        
        document.getElementById('verificationHash').value = '';
        await loadContractData();
        
    } catch (error) {
        console.error('Erreur vérification:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}


// Distribuer les dividendes
async function distributeDividends() {
    const amount = document.getElementById('dividendAmount').value;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showMessage('❌ Montant invalide', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Distribution en cours...', 'info');
        const tx = await contract.distributeDividends({
            value: ethers.utils.parseEther(amount)
        });
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Dividendes distribués!', 'success');
        
        document.getElementById('dividendAmount').value = '';
        await loadContractData();
        
    } catch (error) {
        console.error('Erreur distribution:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Pauser le contrat
async function pauseContract() {
    try {
        showMessage('⏳ Pause en cours...', 'info');
        const tx = await contract.pause();
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Contrat pausé!', 'success');
        
    } catch (error) {
        console.error('Erreur pause:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Reprendre le contrat
async function unpauseContract() {
    try {
        showMessage('⏳ Reprise en cours...', 'info');
        const tx = await contract.unpause();
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Contrat repris!', 'success');
        
    } catch (error) {
        console.error('Erreur reprise:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Utilitaires
function formatEther(value) {
    return parseFloat(ethers.utils.formatEther(value)).toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// Fonction pour les calculs numériques purs (sans formatage)
function parseEther(value) {
    return parseFloat(ethers.utils.formatEther(value));
}

function showMessage(message, type) {
    const container = document.getElementById('statusMessages');
    const messageDiv = document.createElement('div');
    
    let bgColor, textColor;
    switch(type) {
        case 'success':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
        case 'error':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        case 'info':
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            break;
        default:
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-800';
    }
    
    messageDiv.className = `${bgColor} ${textColor} px-4 py-3 rounded mb-2 border`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto-remove après 5 secondes
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
    
    // Scroll vers le message
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Distribution automatique des dividendes
async function autoDistributeDividends() {
    console.log('🚀 autoDistributeDividends appelée');
    
    if (!contract) {
        console.log('❌ Pas de contrat dans autoDistributeDividends');
        showMessage('❌ Connectez-vous d\'abord', 'error');
        return;
    }
    
    try {
        console.log('✅ Début de la distribution automatique');
        showMessage('🧮 Calcul de la distribution automatique...', 'info');
        
        // Récupérer les données nécessaires
        const [totalRevenue, totalDistributed] = await Promise.all([
            contract.totalRevenueCollected(),
            contract.totalRevenueDistributed()
        ]);
        
        const pendingRevenueEUR = parseInt(totalRevenue.toString());
        
        if (pendingRevenueEUR <= 0) {
            showMessage('❌ Aucun revenu à distribuer', 'error');
            return;
        }
        
        // Calculer le montant ETH suggéré - MONTANT FIXE POUR TESTS
        const fixedTestAmount = 0.01; // Montant fixe pour les tests  
        const suggestedETHAmount = fixedTestAmount;
        
        showMessage(`💰 Distribution de ${suggestedETHAmount.toFixed(6)} ETH pour ${pendingRevenueEUR.toLocaleString('fr-FR')} EUR de revenus`, 'info');
        showMessage('⏳ Envoi de la transaction...', 'info');
        
        const tx = await contract.distributeDividends({
            value: ethers.utils.parseEther(suggestedETHAmount.toString())
        });
        
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage('✅ Distribution automatique réussie!', 'success');
        
        // Recharger les données
        await loadContractData();
        
    } catch (error) {
        console.error('Erreur distribution automatique:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Exposer autoDistributeDividends globalement immédiatement après sa définition
window.autoDistributeDividends = autoDistributeDividends;

// Fonction pour adapter l'interface selon le rôle utilisateur
function adaptInterfaceForRole(isOwner, isManager, isQualified) {
    console.log('🎭 Adaptation interface pour rôle:', { isOwner, isManager, isQualified });
    
    // Éléments à masquer/afficher selon le rôle
    const ownerActions = document.querySelectorAll('[data-role="owner"]');
    const managerActions = document.querySelectorAll('[data-role="manager"]');
    const investorActions = document.querySelectorAll('[data-role="investor"]');
    
    // Actions propriétaire
    ownerActions.forEach(element => {
        element.style.display = isOwner ? 'block' : 'none';
    });
    
    // Actions gestionnaire
    managerActions.forEach(element => {
        element.style.display = (isOwner || isManager) ? 'block' : 'none';
    });
    
    // Actions investisseur (transferts nécessitent KYC)
    investorActions.forEach(element => {
        if (element.id === 'transferBtn') {
            element.disabled = !isQualified;
            element.title = isQualified ? 'Transférer vos tokens' : 'KYC requis pour les transferts';
        }
    });
    
    // Notifications contextuelles selon le rôle
    if (typeof notifications !== 'undefined') {
        if (isOwner) {
            notifications.info('Mode Propriétaire', 'Vous avez accès à toutes les fonctions de gestion');
        } else if (isManager) {
            notifications.info('Mode Gestionnaire', 'Vous pouvez collecter des revenus et distribuer des dividendes');
        } else if (!isQualified) {
            notifications.warning('KYC Requis', 'Contactez l\'administrateur pour être qualifié en tant qu\'investisseur', {
                duration: 8000
            });
        }
    }
}

// Exposer la fonction globalement
window.adaptInterfaceForRole = adaptInterfaceForRole;

// Basculer l'affichage de la distribution manuelle
function toggleManualDistribution() {
    const manualDiv = document.getElementById('manualDistribution');
    const showBtn = document.getElementById('showManualBtn');
    
    if (manualDiv.classList.contains('hidden')) {
        manualDiv.classList.remove('hidden');
        showBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        showBtn.title = 'Masquer distribution manuelle';
    } else {
        manualDiv.classList.add('hidden');
        showBtn.innerHTML = '<i class="fas fa-cog"></i>';
        showBtn.title = 'Afficher distribution manuelle';
    }
}

// Calculer manuellement la valeur du token
async function manuallyCalculateTokenValue() {
    console.log('🔥 Fonction manuallyCalculateTokenValue appelée');
    showMessage('🔥 Fonction appelée!', 'info');
    
    if (!contract) {
        console.log('❌ Contract non disponible');
        showMessage('❌ Connectez-vous d\'abord', 'error');
        return;
    }

    console.log('✅ Contract disponible, début du calcul');
    showMessage('✅ Contract trouvé, calcul en cours...', 'info');

    try {
        showMessage('🧮 Calcul de la valeur du token...', 'info');
        
        const [property, totalSupply, tokenValue] = await Promise.all([
            contract.getPropertyMetadata(),
            contract.totalSupply(),
            contract.getTokenValue()
        ]);

        const propertyValueEur = parseFloat(ethers.utils.formatEther(property.totalValue));
        const totalSupplyNum = parseFloat(ethers.utils.formatEther(totalSupply));
        const tokenizedPercentage = property.tokenizedPercentage;
        const currentTokenValue = parseFloat(ethers.utils.formatEther(tokenValue));
        
        console.log('🔍 DONNÉES POUR CALCUL MANUEL:');
        console.log('- Valeur propriété:', propertyValueEur, 'EUR');
        console.log('- % tokenisé:', tokenizedPercentage, '%');
        console.log('- Supply total:', totalSupplyNum, 'tokens');
        console.log('- Valeur actuelle contrat:', currentTokenValue, 'EUR');
        
        if (propertyValueEur > 0 && totalSupplyNum > 0 && tokenizedPercentage > 0) {
            const tokenizedValue = (propertyValueEur * tokenizedPercentage) / 100;
            const calculatedTokenValue = tokenizedValue / totalSupplyNum;
            
            // Mettre à jour l'affichage
            document.getElementById('tokenValue').textContent = '€' + calculatedTokenValue.toFixed(6);
            
            showMessage(`✅ Valeur calculée: €${calculatedTokenValue.toFixed(6)} par token`, 'success');
            showMessage(`🏢 Basé sur: Propriété €${propertyValueEur.toLocaleString('fr-FR')} (${tokenizedPercentage}% tokenisé)`, 'info');
            showMessage(`📊 ${totalSupplyNum.toLocaleString('fr-FR')} tokens au total`, 'info');
            
            // Calculer la valeur du portefeuille utilisateur
            const myBalance = await contract.balanceOf(userAddress);
            const balanceNum = parseFloat(ethers.utils.formatEther(myBalance));
            const portfolioValue = balanceNum * calculatedTokenValue;
            showMessage(`💼 Votre portefeuille: ${balanceNum.toLocaleString('fr-FR')} tokens = €${portfolioValue.toLocaleString('fr-FR')}`, 'success');
            
        } else {
            showMessage('❌ Impossible de calculer: données insuffisantes', 'error');
            if (propertyValueEur <= 0) showMessage('- Valeur de propriété: ' + propertyValueEur, 'error');
            if (tokenizedPercentage <= 0) showMessage('- % tokenisé: ' + tokenizedPercentage, 'error');
            if (totalSupplyNum <= 0) showMessage('- Supply total: ' + totalSupplyNum, 'error');
        }

    } catch (error) {
        console.error('Erreur calcul:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Amélioration de la fonction collectRevenue pour forcer le recalcul
async function collectRevenue() {
    const amount = document.getElementById('revenueAmount').value;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showMessage('❌ Montant invalide', 'error');
        return;
    }
    
    try {
        showMessage('⏳ Collecte en cours...', 'info');
        const tx = await contract.collectRevenue(amount);
        showMessage(`⏳ Transaction envoyée: ${tx.hash}`, 'info');
        
        await tx.wait();
        showMessage(`✅ ${parseFloat(amount).toLocaleString('fr-FR')} EUR de revenus collectés!`, 'success');
        showMessage('🧮 Calcul automatique de la distribution en cours...', 'info');
        
        document.getElementById('revenueAmount').value = '';
        
        // Recharger et recalculer automatiquement
        await loadContractData();
        
        // Afficher un résumé de ce qui peut être distribué
        setTimeout(() => {
            showMessage('💡 Distribution automatique disponible! Cliquez sur "Distribution Auto"', 'info');
        }, 1000);
        
    } catch (error) {
        console.error('Erreur collecte:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
}

// Rendre les fonctions accessibles globalement dès que le script se charge
window.manuallyCalculateTokenValue = async function() {
    console.log('🔥 Fonction manuallyCalculateTokenValue appelée (globale)');
    showMessage('🔥 Fonction appelée!', 'info');
    
    if (!contract) {
        console.log('❌ Contract non disponible');
        showMessage('❌ Connectez-vous d\'abord', 'error');
        return;
    }

    console.log('✅ Contract disponible, début du calcul');
    showMessage('✅ Contract trouvé, calcul en cours...', 'info');

    try {
        showMessage('🧮 Calcul de la valeur du token...', 'info');
        
        const [property, totalSupply, tokenValue] = await Promise.all([
            contract.getPropertyMetadata(),
            contract.totalSupply(),
            contract.getTokenValue()
        ]);

        const propertyValueEur = parseFloat(ethers.utils.formatEther(property.totalValue));
        const totalSupplyNum = parseFloat(ethers.utils.formatEther(totalSupply));
        const tokenizedPercentage = property.tokenizedPercentage;
        const currentTokenValue = parseFloat(ethers.utils.formatEther(tokenValue));
        
        console.log('🔍 DONNÉES POUR CALCUL MANUEL:');
        console.log('- Valeur propriété:', propertyValueEur, 'EUR');
        console.log('- % tokenisé:', tokenizedPercentage, '%');
        console.log('- Supply total:', totalSupplyNum, 'tokens');
        console.log('- Valeur actuelle contrat:', currentTokenValue, 'EUR');
        
        if (propertyValueEur > 0 && totalSupplyNum > 0 && tokenizedPercentage > 0) {
            const tokenizedValue = (propertyValueEur * tokenizedPercentage) / 100;
            const calculatedTokenValue = tokenizedValue / totalSupplyNum;
            
            // Mettre à jour l'affichage
            document.getElementById('tokenValue').textContent = '€' + calculatedTokenValue.toFixed(6);
            
            showMessage(`✅ Valeur calculée: €${calculatedTokenValue.toFixed(6)} par token`, 'success');
            showMessage(`🏢 Basé sur: Propriété €${propertyValueEur.toLocaleString('fr-FR')} (${tokenizedPercentage}% tokenisé)`, 'info');
            showMessage(`📊 ${totalSupplyNum.toLocaleString('fr-FR')} tokens au total`, 'info');
            
            // Calculer la valeur du portefeuille utilisateur
            const myBalance = await contract.balanceOf(userAddress);
            const balanceNum = parseFloat(ethers.utils.formatEther(myBalance));
            const portfolioValue = balanceNum * calculatedTokenValue;
            showMessage(`💼 Votre portefeuille: ${balanceNum.toLocaleString('fr-FR')} tokens = €${portfolioValue.toLocaleString('fr-FR')}`, 'success');
            
        } else {
            showMessage('❌ Impossible de calculer: données insuffisantes', 'error');
            if (propertyValueEur <= 0) showMessage('- Valeur de propriété: ' + propertyValueEur, 'error');
            if (tokenizedPercentage <= 0) showMessage('- % tokenisé: ' + tokenizedPercentage, 'error');
            if (totalSupplyNum <= 0) showMessage('- Supply total: ' + totalSupplyNum, 'error');
        }

    } catch (error) {
        console.error('Erreur calcul:', error);
        showMessage(`❌ Erreur: ${error.reason || error.message}`, 'error');
    }
};

// Fonction de test globale
window.testCalculateValue = function() {
    console.log('🧪 Test function called');
    showMessage('🧪 Test function called!', 'info');
    window.manuallyCalculateTokenValue();
};

// Fonction simple pour forcer l'ajout de l'event listener
window.attachCalculateButton = function() {
    const btn = document.getElementById('calculateTokenValueBtn');
    if (btn) {
        btn.onclick = window.manuallyCalculateTokenValue;
        console.log('✅ Event listener attaché manuellement');
        showMessage('✅ Bouton connecté!', 'success');
    } else {
        console.log('❌ Bouton non trouvé');
    }
};

// Écouter les changements de compte MetaMask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            // Déconnecté
            location.reload();
        } else {
            // Compte changé
            await connectWallet();
        }
    });
    
    window.ethereum.on('chainChanged', (chainId) => {
        // Réseau changé
        location.reload();
    });
}