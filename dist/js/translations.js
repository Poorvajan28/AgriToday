// Translations for AgroCulture
const translations = {
    en: {
        // Header
        'search-placeholder': 'Search products...',
        'language': 'Language',
        'login': 'Login',
        'register': 'Register',
        'logout': 'Logout',
        'profile': 'Profile',
        
        // Hero section
        'hero-title': 'Welcome to AgriToday',
        'hero-subtitle': 'Connecting farmers, buyers, and transporters in one platform',
        'get-started': 'Get Started',
        'learn-more': 'Learn More',
        
        // Features
        'features-title': 'Our Features',
        'farmers-title': 'For Farmers',
        'farmers-desc': 'Sell your products directly to buyers',
        'buyers-title': 'For Buyers',
        'buyers-desc': 'Find fresh agricultural products',
        'transport-title': 'For Transporters',
        'transport-desc': 'Connect farmers with buyers',
        
        // Auth
        'email': 'Email',
        'password': 'Password',
        'name': 'Full Name',
        'phone': 'Phone Number',
        'role': 'Role',
        'select-role': 'Select your role',
        'farmer': 'Farmer',
        'buyer': 'Buyer',
        'transporter': 'Transporter',
        'forgot-password': 'Forgot Password?',
        'no-account': "Don't have an account?",
        'have-account': 'Already have an account?',
        
        // Subscription
        'subscription': 'Subscription Required',
        'subscription-required': 'Subscription Required',
        'subscription-message': 'To access role-specific features, you need an active subscription.',
        'per-month': '/month',
        'pay-now': 'Pay Now'
    },
    hi: {
        // Hindi translations
        'search-placeholder': 'उत्पाद खोजें...',
        'language': 'भाषा',
        'login': 'लॉगिन',
        'register': 'पंजीकरण',
        'logout': 'लॉगआउट',
        'profile': 'प्रोफ़ाइल',
        'hero-title': 'AgriToday में आपका स्वागत है',
        'hero-subtitle': 'किसानों, खरीदारों और परिवहनकर्ताओं को एक मंच पर जोड़ना',
        'get-started': 'शुरू करें',
        'learn-more': 'और जानें'
    }
};

let currentLanguage = 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    translatePage();
}

function translatePage() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

// Initialize translations when DOM is loaded
document.addEventListener('DOMContentLoaded', translatePage);
