# 🏢 RWA Smart Contracts - Real Estate Tokenization Platform

[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)](https://sepolia.etherscan.io/token/0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://docs.soliditylang.org/)

> **⚠️ Avertissement Important**  
> Ce projet est à des fins **éducatives et de démonstration uniquement**. Toutes les propriétés utilisées sont **FICTIVES**. Ne pas utiliser en production sans adaptations légales appropriées.

## 📋 Description

Plateforme complète de tokenisation d'actifs immobiliers (RWA - Real World Assets) sur Ethereum, permettant la création, gestion et distribution de revenus de tokens représentant des parts d'immobilier.

## ✨ Fonctionnalités

### 🔐 Smart Contract (Solidity)
- **ERC-20 Compatible** avec extensions personnalisées
- **Gestion des revenus** avec distribution automatique
- **Contrôle d'accès** (Propriétaire, Gestionnaire, Investisseur)
- **Sécurité** : ReentrancyGuard, Pausable, Ownable
- **Compliance** : Fonctions KYC/AML intégrables

### 🌐 Interface Web (Frontend)
- **3 Interfaces** adaptées aux différents utilisateurs
- **Intégration MetaMask** complète
- **Notifications modernes** avec système de toast
- **Status bar intelligente** (Réseau, KYC, Rôle)
- **Responsive design** pour mobile et desktop
- **Mode démo** avec données fictives

### 💰 Gestion Financière
- **Calcul automatique** de la valeur des tokens
- **Distribution proportionnelle** des revenus
- **Tableau de bord investisseur** avec métriques
- **Historique des transactions**
- **Formatage monétaire** en EUR

## 🏗️ Architecture

```
rwa-smart-contracts/
├── contracts/              # Smart contracts Solidity
├── frontend/               # Interface web principale  
├── deploy-demo/            # Version déployable sur Netlify
├── scripts/                # Scripts de déploiement et interaction
├── test/                   # Tests unitaires
└── ignition/               # Modules de déploiement Hardhat
```

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- NPM ou Yarn
- MetaMask installé
- Compte Sepolia avec ETH de test

### Installation
```bash
git clone https://github.com/votre-username/rwa-smart-contracts.git
cd rwa-smart-contracts
npm install
```

### Lancement du Frontend
```bash
# Méthode 1: Serveur simple
npm run frontend

# Méthode 2: Script bash
./start-frontend.sh
```

Interface accessible sur : `http://localhost:8091`

## 🔧 Smart Contract

### Déploiement
**Réseau**: Sepolia Testnet  
**Adresse**: `0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619`  
**Explorer**: [Voir sur Etherscan](https://sepolia.etherscan.io/token/0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619)

### Fonctions Principales
```solidity
// Gestion des tokens
function mint(address to, uint256 amount) external onlyOwner
function burn(uint256 amount) external

// Gestion des revenus  
function addRevenue(uint256 amount) external onlyPropertyManager
function distributeRevenue() external onlyPropertyManager
function claimRevenue() external

// Informations de la propriété
function getTokenValue() external view returns (uint256)
function getPropertyInfo() external view returns (PropertyInfo)
```

## 🎨 Interfaces Utilisateur

### 1. Interface Complète (`main-interface.html`)
- Gestion complète des tokens et revenus
- Actions propriétaire (mint, burn, gestion)
- Système de notifications moderne
- Interface adaptative selon le rôle

### 2. Dashboard Investisseur (`investor-dashboard.html`)  
- Vue optimisée pour les investisseurs
- Métriques de performance
- Suivi du portefeuille
- Historique des dividendes

### 3. Interface Simple (`simple.html`)
- Version épurée pour tests rapides
- Actions essentielles
- Diagnostic intégré
- Parfait pour les développeurs

## 🌐 Démo Live

**URL**: [https://beamish-frangollo-d88cee.netlify.app](https://beamish-frangollo-d88cee.netlify.app)

La démo utilise des propriétés fictives et est configurée pour Sepolia Testnet.

## 🛡️ Sécurité

- **Testnet uniquement** : Aucune valeur réelle
- **Données fictives** : Propriétés entièrement imaginaires  
- **Code auditable** : Open source
- **Bonnes pratiques** : ReentrancyGuard, Access Control

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests de déploiement
npx hardhat test

# Couverture de code
npm run coverage
```

## 📊 Exemple d'Utilisation

### Configuration du Réseau
```javascript
// Sepolia Testnet
const config = {
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
    contractAddress: "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619"
}
```

### Interaction avec le Contract
```javascript
// Connexion MetaMask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Achat de tokens
const tx = await contract.mint(userAddress, tokenAmount);
await tx.wait();

// Calcul de la valeur
const tokenValue = await contract.getTokenValue();
console.log(`Valeur par token: ${ethers.utils.formatEther(tokenValue)} ETH`);
```

## 💡 Technologies Utilisées

- **Smart Contracts**: Solidity 0.8.24, OpenZeppelin
- **Framework**: Hardhat
- **Frontend**: HTML5, JavaScript ES6, TailwindCSS
- **Blockchain**: Ethereum (Sepolia), Ethers.js v5.7.2
- **Déploiement**: Netlify
- **Tests**: Hardhat, Chai

## 📈 Roadmap

- [ ] Interface mobile native (React Native)
- [ ] Intégration avec d'autres wallets (WalletConnect)
- [ ] Système de gouvernance (DAO)
- [ ] Oracles pour prix immobilier en temps réel
- [ ] Support multi-chaînes (Polygon, BSC)

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## ⚠️ Disclaimer

**Ce projet est uniquement à des fins éducatives.** Les exemples de propriétés sont entièrement fictifs. Aucune propriété réelle n'est tokenisée. Ne pas utiliser pour des transactions financières réelles sans conseil juridique approprié.

## 📞 Contact

- **GitHub**: [Votre profil](https://github.com/cybersecuriteam)
- **Demo**: [RWA Platform](https://rwa-demo-plateform.netlify.app/)
- **Contract**: [Etherscan](https://sepolia.etherscan.io/token/0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619)

---

**🏢 RWA Smart Contracts** - Démonstration de Tokenisation d'Actifs Immobiliers sur Ethereum
