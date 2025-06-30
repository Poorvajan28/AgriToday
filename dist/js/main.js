// Main application script for AgroCulture

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 AgriToday Frontend Loaded Successfully!');
    
    // Hide loading spinner
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
        }, 1000);
    }
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize modals
    initializeModals();
    
    // Initialize products functionality
    initializeProducts();
    
    // Check for saved user session
    checkUserSession();
});

function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

function handleSearch(event) {
    const query = event.target.value.trim();
    if (query.length > 2) {
        // Simulate search functionality
        console.log('Searching for:', query);
        showNotification(`Searching for "${query}"...`, 'info');
    }
}

function initializeNavigation() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navigation = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navigation) {
        mobileMenuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
        });
    }
    
    // Language selector
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            localStorage.setItem('preferred-language', e.target.value);
        });
        
        // Load saved language preference
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang) {
            langSelector.value = savedLang;
            setLanguage(savedLang);
        }
    }
}

function initializeModals() {
    // Close modals with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

function checkUserSession() {
    const user = storage.get('user');
    if (user) {
        showNotification(`Welcome back, ${user.name}!`, 'success');
    }
}

// Products functionality
function initializeProducts() {
    // Get Products button click
    const getProductsBtn = document.querySelector('[data-translate="get-started"]');
    if (getProductsBtn) {
        getProductsBtn.addEventListener('click', () => {
            showProductsSection();
        });
    }

    // Products navigation link
    const productsLink = document.querySelector('[href="#products"]');
    if (productsLink) {
        productsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showProductsSection();
        });
    }
}

function showProductsSection() {
    // Check if user is logged in
    if (!window.authManager?.currentUser) {
        window.authManager?.showModal('login-modal');
        return;
    }

    // Check subscription status
    if (!window.authManager?.isSubscriptionActive()) {
        window.authManager?.showModal('subscription-modal');
        return;
    }

    // Create products section if it doesn't exist
    let productsSection = document.getElementById('products-section');
    if (!productsSection) {
        productsSection = createProductsSection();
        document.getElementById('main-content').appendChild(productsSection);
    }

    // Scroll to products section
    productsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Load demo products
    loadDemoProducts();
}

function createProductsSection() {
    const section = document.createElement('section');
    section.id = 'products-section';
    section.className = 'products-section';
    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Available Products</h2>
            <div class="products-filters">
                <input type="text" class="search-input" placeholder="Search products..." id="product-search">
                <select class="category-filter" id="category-filter">
                    <option value="">All Categories</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                </select>
            </div>
            <div class="products-grid" id="products-grid">
                <!-- Products will be loaded here -->
            </div>
        </div>
    `;
    return section;
}

function loadDemoProducts() {
    const products = [
        {
            id: 1,
            name: 'Fresh Tomatoes',
            price: 50,
            unit: 'kg',
            farmer: 'Raj Patel',
            location: 'Punjab',
            category: 'vegetables',
            image: '/images/tomatoes.jpg',
            description: 'Fresh, organic tomatoes grown without pesticides',
            rating: 4.5,
            available: true
        },
        {
            id: 2,
            name: 'Organic Rice',
            price: 80,
            unit: 'kg',
            farmer: 'Sunita Sharma',
            location: 'West Bengal',
            category: 'grains',
            image: '/images/rice.jpg',
            description: 'Premium quality basmati rice, organically grown',
            rating: 4.8,
            available: true
        },
        {
            id: 3,
            name: 'Fresh Wheat',
            price: 40,
            unit: 'kg',
            farmer: 'Amit Kumar',
            location: 'Haryana',
            category: 'grains',
            image: '/images/wheat.jpg',
            description: 'High-quality wheat flour perfect for baking',
            rating: 4.3,
            available: true
        },
        {
            id: 4,
            name: 'Fresh Apples',
            price: 120,
            unit: 'kg',
            farmer: 'Priya Singh',
            location: 'Himachal Pradesh',
            category: 'fruits',
            image: '/images/apples.jpg',
            description: 'Crisp and juicy Kashmiri apples',
            rating: 4.7,
            available: true
        },
        {
            id: 5,
            name: 'Organic Milk',
            price: 60,
            unit: 'liter',
            farmer: 'Ramesh Dairy Farm',
            location: 'Gujarat',
            category: 'dairy',
            image: '/images/milk.jpg',
            description: 'Fresh organic milk from grass-fed cows',
            rating: 4.6,
            available: true
        },
        {
            id: 6,
            name: 'Green Vegetables Mix',
            price: 35,
            unit: 'kg',
            farmer: 'Kavita Farms',
            location: 'Maharashtra',
            category: 'vegetables',
            image: '/images/vegetables.jpg',
            description: 'Fresh seasonal green vegetables bundle',
            rating: 4.4,
            available: true
        }
    ];

    displayProducts(products);
    setupProductFilters(products);
}

function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <div class="product-img-placeholder">${product.name.charAt(0)}</div>
                ${product.available ? '<span class="availability-badge available">Available</span>' : '<span class="availability-badge unavailable">Out of Stock</span>'}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-farmer">by ${product.farmer}</p>
                <p class="product-location">📍 ${product.location}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}
                </div>
                <div class="product-price">
                    <span class="price">₹${product.price}</span>
                    <span class="unit">/${product.unit}</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="buyProduct(${product.id})">
                        🛒 Buy Now
                    </button>
                    <button class="btn btn-outline" onclick="addToCart(${product.id})">
                        ❤️ Save
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupProductFilters(products) {
    const searchInput = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            filterProducts(products, e.target.value, categoryFilter?.value || '');
        }, 300));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterProducts(products, searchInput?.value || '', e.target.value);
        });
    }
}

function filterProducts(products, searchQuery, category) {
    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
}

function buyProduct(productId) {
    showNotification(`Initiating purchase for product ID: ${productId}`, 'info');
    // Here you would implement the actual purchase flow
}

function addToCart(productId) {
    showNotification(`Product ${productId} saved to favorites!`, 'success');
    // Here you would implement the cart/favorites functionality
}

// Demo functionality for development
function showDemoData() {
    console.log('Demo data initialization completed');
    showNotification('Welcome to AgriToday! Click "Get Started" to browse products.', 'info');
}

// Initialize demo data if in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(showDemoData, 2000);
}
