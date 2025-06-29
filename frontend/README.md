# 🌐 Interface Web RWA Real Estate Token

Interface web simple pour interagir avec votre smart contract de tokenisation immobilière sur Sepolia.

## 🚀 Démarrage rapide

### Option 1: Serveur HTTP simple
```bash
# Depuis le dossier frontend/
python3 -m http.server 8000
# ou
npx serve .
# ou
php -S localhost:8000
```

Puis ouvrez http://localhost:8000

### Option 2: Live Server (VS Code)
1. Installez l'extension "Live Server" dans VS Code
2. Clic droit sur `index.html` → "Open with Live Server"

## 🔧 Prérequis

- **MetaMask** installé et configuré
- **Réseau Sepolia** ajouté à MetaMask
- **Sepolia ETH** pour les transactions (faucet: https://sepoliafaucet.com)
- **Navigateur moderne** (Chrome, Firefox, Edge)

## 💡 Fonctionnalités

### 📊 Visualisation
- ✅ Métadonnées de la propriété en temps réel
- ✅ Informations du token (nom, symbole, supply)
- ✅ Balance personnel et valeur par token
- ✅ Statut KYC de l'utilisateur connecté

### 👥 Actions Investisseur
- ✅ Vérifier le statut KYC
- ✅ Transférer des tokens vers d'autres investisseurs qualifiés
- ✅ Voir les balances en temps réel

### 👑 Actions Propriétaire (Owner)
- ✅ Qualifier/disqualifier des investisseurs (KYC)
- ✅ Mettre à jour la valorisation de la propriété
- ✅ Vérifier la propriété avec documents légaux
- ✅ Pauser/reprendre le contrat en cas d'urgence

### 🏢 Actions Gestionnaire
- ✅ Collecter les revenus de la propriété
- ✅ Distribuer des dividendes aux détenteurs de tokens
- ✅ Suivre les revenus totaux collectés

## 🎯 Guide d'utilisation

### 1. Connexion
1. Cliquez sur "Connecter Wallet"
2. Acceptez la connexion MetaMask
3. L'interface se mettra automatiquement sur Sepolia

### 2. Premier investisseur
1. Le owner doit d'abord qualifier l'investisseur (section "Actions Propriétaire")
2. Entrez l'adresse de l'investisseur et cliquez "Qualifier"
3. Une fois qualifié, le owner peut transférer des tokens

### 3. Achat/Vente de tokens
```
Achat = Transfer depuis le owner vers l'investisseur
Vente = Transfer depuis l'investisseur vers un autre investisseur qualifié
```

### 4. Gestion de la propriété
- Mise à jour régulière des valorisations
- Vérification avec hash IPFS des documents
- Collecte et distribution des revenus

## 🔐 Sécurité

L'interface respecte toutes les règles de sécurité du smart contract :
- ✅ Seuls les investisseurs qualifiés peuvent recevoir des tokens
- ✅ Vérification automatique des permissions
- ✅ Blocage des adresses blacklistées
- ✅ Contrôles d'accès Owner/PropertyManager

## 🐛 Dépannage

### MetaMask non détecté
- Vérifiez que MetaMask est installé
- Actualisez la page
- Vérifiez que MetaMask n'est pas bloqué par le navigateur

### Transactions qui échouent
- Vérifiez que vous êtes sur le réseau Sepolia
- Vérifiez votre balance Sepolia ETH
- Vérifiez que vous avez les permissions nécessaires
- Vérifiez que l'adresse destinataire est qualifiée (KYC)

### Contrat pausé
- Seul le owner peut pauser/reprendre
- Aucun transfert n'est possible quand le contrat est pausé

## 📱 Interface mobile

L'interface est responsive et fonctionne sur mobile avec MetaMask mobile ou WalletConnect.

## 🔗 Liens utiles

- **Contrat sur Sepolia**: https://sepolia.etherscan.io/address/0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619
- **Faucet Sepolia**: https://sepoliafaucet.com
- **MetaMask**: https://metamask.io
- **Documentation Ethers.js**: https://docs.ethers.io/v5/

## 🎉 Prêt à tester !

Votre interface est maintenant prête pour tester toutes les fonctionnalités de votre smart contract RWA en situation réelle !