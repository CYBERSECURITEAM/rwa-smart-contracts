// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RealEstateToken
 * @dev Token ERC20 pour la tokenisation d'actifs immobiliers
 * Fonctionnalités :
 * - Tokenisation fractionnée d'un bien immobilier
 * - Mécanismes de sécurité (Pausable, ReentrancyGuard)
 * - Métadonnées de l'actif immobilier
 * - Système de vérification et validation
 */
contract RealEstateToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Structure des métadonnées de l'actif immobilier
    struct PropertyMetadata {
        string propertyAddress;      // Adresse physique du bien
        string propertyType;         // Type (Bureau, Résidentiel, Commercial, etc.)
        uint256 totalValue;          // Valeur totale du bien en EUR (en wei pour précision)
        uint256 tokenizedPercentage; // Pourcentage tokenisé (ex: 80 pour 80%)
        string legalDocumentHash;    // Hash IPFS des documents légaux
        string valuationReportHash;  // Hash IPFS du rapport d'évaluation
        bool isVerified;             // Statut de vérification
        uint256 lastValuationDate;   // Timestamp de la dernière évaluation
    }
    
    // Métadonnées de la propriété
    PropertyMetadata public property;
    
    // Mapping des investisseurs qualifiés (KYC/AML)
    mapping(address => bool) public qualifiedInvestors;
    
    // Mapping des adresses blacklistées
    mapping(address => bool) public blacklisted;
    
    // Adresse du gestionnaire de propriété (peut collecter les revenus)
    address public propertyManager;
    
    // Revenus collectés et distribuables
    uint256 public totalRevenueCollected;
    uint256 public totalRevenueDistributed;
    
    // Events
    event PropertyVerified(address indexed verifier, string documentHash);
    event PropertyUpdated(string newValuationHash, uint256 newValue);
    event InvestorQualified(address indexed investor);
    event InvestorDisqualified(address indexed investor);
    event RevenueCollected(uint256 amount);
    event DividendsDistributed(uint256 totalAmount, uint256 perToken);
    event AddressBlacklisted(address indexed account);
    event AddressWhitelisted(address indexed account);
    
    // Modifiers
    modifier onlyQualifiedInvestor(address account) {
        require(qualifiedInvestors[account], "Not a qualified investor");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Address is blacklisted");
        _;
    }
    
    modifier onlyPropertyManager() {
        require(msg.sender == propertyManager, "Only property manager");
        _;
    }
    
    /**
     * @dev Constructeur
     * @param name Nom du token (ex: "Paris Office Token")
     * @param symbol Symbole du token (ex: "POT")
     * @param totalSupply Nombre total de tokens à créer
     * @param propertyData Métadonnées de la propriété
     * @param _propertyManager Adresse du gestionnaire de propriété
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        PropertyMetadata memory propertyData,
        address _propertyManager
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_propertyManager != address(0), "Invalid property manager");
        require(propertyData.totalValue > 0, "Invalid property value");
        require(propertyData.tokenizedPercentage > 0 && propertyData.tokenizedPercentage <= 100, "Invalid tokenization percentage");
        
        property = propertyData;
        propertyManager = _propertyManager;
        
        // Le owner est automatiquement qualifié
        qualifiedInvestors[msg.sender] = true;
        qualifiedInvestors[_propertyManager] = true;
        
        // Mint du supply total au owner
        _mint(msg.sender, totalSupply);
        
        emit InvestorQualified(msg.sender);
        emit InvestorQualified(_propertyManager);
    }
    
    /**
     * @dev Vérifier et valider la propriété
     * @param documentHash Hash IPFS des nouveaux documents légaux
     */
    function verifyProperty(string memory documentHash) external onlyOwner {
        require(bytes(documentHash).length > 0, "Document hash cannot be empty");
        
        property.legalDocumentHash = documentHash;
        property.isVerified = true;
        
        emit PropertyVerified(msg.sender, documentHash);
    }
    
    /**
     * @dev Mettre à jour la valorisation de la propriété
     * @param newValue Nouvelle valeur en EUR (en wei)
     * @param valuationHash Hash IPFS du rapport d'évaluation
     */
    function updatePropertyValuation(
        uint256 newValue, 
        string memory valuationHash
    ) external onlyOwner {
        require(newValue > 0, "Invalid valuation");
        require(bytes(valuationHash).length > 0, "Valuation hash cannot be empty");
        
        property.totalValue = newValue;
        property.valuationReportHash = valuationHash;
        property.lastValuationDate = block.timestamp;
        
        emit PropertyUpdated(valuationHash, newValue);
    }
    
    /**
     * @dev Qualifier un investisseur (processus KYC/AML)
     * @param investor Adresse de l'investisseur
     */
    function qualifyInvestor(address investor) external onlyOwner {
        require(investor != address(0), "Invalid address");
        require(!blacklisted[investor], "Address is blacklisted");
        
        qualifiedInvestors[investor] = true;
        emit InvestorQualified(investor);
    }
    
    /**
     * @dev Disqualifier un investisseur
     * @param investor Adresse de l'investisseur
     */
    function disqualifyInvestor(address investor) external onlyOwner {
        qualifiedInvestors[investor] = false;
        emit InvestorDisqualified(investor);
    }
    
    /**
     * @dev Blacklister une adresse
     * @param account Adresse à blacklister
     */
    function blacklistAddress(address account) external onlyOwner {
        require(account != owner(), "Cannot blacklist owner");
        require(account != propertyManager, "Cannot blacklist property manager");
        
        blacklisted[account] = true;
        qualifiedInvestors[account] = false;
        
        emit AddressBlacklisted(account);
    }
    
    /**
     * @dev Retirer une adresse de la blacklist
     * @param account Adresse à retirer de la blacklist
     */
    function whitelistAddress(address account) external onlyOwner {
        blacklisted[account] = false;
        emit AddressWhitelisted(account);
    }
    
    /**
     * @dev Collecter les revenus de la propriété
     * @param amount Montant des revenus collectés
     */
    function collectRevenue(uint256 amount) external onlyPropertyManager {
        require(amount > 0, "Invalid amount");
        
        totalRevenueCollected += amount;
        emit RevenueCollected(amount);
    }
    
    /**
     * @dev Distribuer les dividendes aux détenteurs de tokens
     */
    function distributeDividends() external payable onlyPropertyManager nonReentrant {
        require(msg.value > 0, "No dividends to distribute");
        require(totalSupply() > 0, "No tokens in circulation");
        
        uint256 dividendPerToken = msg.value / totalSupply();
        totalRevenueDistributed += msg.value;
        
        // Note: Dans un contrat production, il faudrait implémenter
        // un système de claim individuel pour éviter les problèmes de gas
        
        emit DividendsDistributed(msg.value, dividendPerToken);
    }
    
    /**
     * @dev Calculer la valeur d'un token en EUR
     * @return Valeur d'un token en wei (représentant des EUR)
     */
    function getTokenValue() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        
        uint256 tokenizedValue = (property.totalValue * property.tokenizedPercentage) / 100;
        return tokenizedValue / totalSupply();
    }
    
    /**
     * @dev Obtenir les métadonnées complètes de la propriété
     */
    function getPropertyMetadata() external view returns (PropertyMetadata memory) {
        return property;
    }
    
    /**
     * @dev Pausable: Pause les transferts
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Pausable: Reprendre les transferts
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override des transferts pour inclure les vérifications de sécurité
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused notBlacklisted(from) notBlacklisted(to) {
        // Vérifications KYC pour les transferts (sauf mint/burn)
        if (from != address(0) && to != address(0)) {
            require(qualifiedInvestors[from], "Sender not qualified");
            require(qualifiedInvestors[to], "Recipient not qualified");
        }
        
        super._update(from, to, value);
    }
    
    /**
     * @dev Fonction de secours pour récupérer des ETH envoyés par erreur
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Permettre au contrat de recevoir des ETH
     */
    receive() external payable {
        // ETH reçus pour les dividendes
    }
}