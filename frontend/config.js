// Configuration globale de l'application RWA
window.RWA_CONFIG = {
    // Mode démo pour masquer les vraies adresses de propriété
    DEMO_MODE: true,
    
    // Données fictives de remplacement
    DEMO_PROPERTY: {
        address: "456 Rue de la Tokenisation, 75000 DemoVille, France [FICTIF]",
        type: "Bureau Commercial - Propriété de Démonstration",
        description: "Cette propriété est entièrement fictive et utilisée à des fins de démonstration"
    },
    
    // Configuration du contrat
    CONTRACT: {
        address: "0x4f8149CfC88d277c6e740Cb3Bb2CFed03281D619",
        network: "sepolia",
        networkId: "0xaa36a7"
    },
    
    // Messages de disclaimer
    DISCLAIMER: {
        short: "DÉMONSTRATION - Propriétés fictives",
        long: "Cette interface utilise des propriétés fictives à des fins éducatives. Aucun actif immobilier réel n'est associé à ces contrats.",
        notification: "Les vraies adresses de propriété sont masquées et remplacées par des données fictives pour cette démonstration."
    },
    
    // Formatage des devises
    CURRENCY: {
        locale: 'fr-FR',
        currency: 'EUR',
        decimals: 2
    },
    
    // Paramètres de l'interface
    UI: {
        notificationDuration: 5000,
        disclaimerDuration: 6000,
        cooldownPeriod: 60000 // 1 minute
    }
};

// Fonction helper pour vérifier si on est en mode démo
window.isDemoMode = function() {
    return window.RWA_CONFIG.DEMO_MODE;
};

// Fonction helper pour obtenir les données fictives
window.getDemoProperty = function() {
    return window.RWA_CONFIG.DEMO_PROPERTY;
};

console.log('🔧 Configuration RWA chargée:', window.RWA_CONFIG.DEMO_MODE ? 'Mode DÉMO' : 'Mode PRODUCTION');