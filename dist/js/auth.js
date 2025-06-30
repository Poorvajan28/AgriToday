// Authentication functionality for AgroCulture

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.trialEndDate = null;
        this.initEventListeners();
        this.checkAuthStatus();
        this.checkTrialStatus();
    }

    initEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Modal controls
        this.setupModalEvents();

        // User menu events
        this.setupUserMenuEvents();

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

    setupModalEvents() {
        // Get all modals
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close-modal');
        
        // Close modal when clicking close button
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modal when clicking outside
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Login/Register links
        const loginLinks = document.querySelectorAll('[href="#login"]');
        const registerLinks = document.querySelectorAll('[href="#register"]');

        loginLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('login-modal');
            });
        });

        registerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('register-modal');
            });
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const formData = getFormData(form);

        // Basic validation
        if (!isValidEmail(formData.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!formData.password) {
            showNotification('Please enter your password', 'error');
            return;
        }

        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Logging in...';
            submitButton.disabled = true;

            // For demo purposes, simulate API call
            // Replace this with actual API call when backend is deployed
            await this.simulateLogin(formData);

            // Reset form and close modal
            form.reset();
            this.hideModal('login-modal');
            showNotification('Login successful!', 'success');

        } catch (error) {
            showNotification(error.message || 'Login failed', 'error');
        } finally {
            // Reset button state
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Login';
            submitButton.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const formData = getFormData(form);

        // Validation
        if (!formData.name.trim()) {
            showNotification('Please enter your full name', 'error');
            return;
        }

        if (!isValidEmail(formData.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!isValidPhone(formData.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        if (!formData.role) {
            showNotification('Please select your role', 'error');
            return;
        }

        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Registering...';
            submitButton.disabled = true;

            // For demo purposes, simulate API call
            await this.simulateRegister(formData);

            // Reset form and close modal
            form.reset();
            this.hideModal('register-modal');
            showNotification('Registration successful! Please login.', 'success');

        } catch (error) {
            showNotification(error.message || 'Registration failed', 'error');
        } finally {
            // Reset button state
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Register';
            submitButton.disabled = false;
        }
    }

    // Simulate API calls for demo
    async simulateLogin(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (credentials.email && credentials.password) {
                    const user = {
                        id: 1,
                        name: 'Demo User',
                        email: credentials.email,
                        role: 'farmer'
                    };
                    this.setUser(user);
                    resolve(user);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }

    async simulateRegister(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (userData.email && userData.password) {
                    resolve({ message: 'User registered successfully' });
                } else {
                    reject(new Error('Registration failed'));
                }
            }, 1000);
        });
    }

    setUser(user) {
        this.currentUser = user;
        storage.set('user', user);
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        storage.remove('user');
        removeAuthToken();
        this.updateUI();
        showNotification('Logged out successfully', 'info');
    }

    checkAuthStatus() {
        const user = storage.get('user');
        if (user) {
            this.currentUser = user;
            this.updateUI();
        }
    }

    setupUserMenuEvents() {
        // User avatar click to toggle dropdown
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('dropdown-menu');
                if (dropdown) {
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        }

        // Profile link functionality
        const profileLinks = document.querySelectorAll('[href="#profile"]');
        profileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserProfile();
            });
        });

        // Dashboard link functionality
        const dashboardLinks = document.querySelectorAll('[href="#dashboard"]');
        dashboardLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        });

        // Subscription link functionality
        const subscriptionLinks = document.querySelectorAll('[href="#subscription"]');
        subscriptionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSubscription();
            });
        });

        // Logout functionality
        const logoutLinks = document.querySelectorAll('[href="#logout"]');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });
    }

    showUserProfile() {
        if (!this.currentUser) {
            showNotification('Please login to view your profile', 'warning');
            return;
        }

        // Create profile modal content
        const profileModal = this.createProfileModal();
        document.body.appendChild(profileModal);
        
        setTimeout(() => {
            profileModal.style.display = 'flex';
        }, 100);
    }

    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>User Profile</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <img src="/images/default-avatar.png" alt="User Avatar" class="avatar-large">
                        </div>
                        <div class="profile-details">
                            <h3>${this.currentUser.name}</h3>
                            <p><strong>Email:</strong> ${this.currentUser.email}</p>
                            <p><strong>Role:</strong> ${this.currentUser.role}</p>
                            <p><strong>Member Since:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary edit-profile-btn">Edit Profile</button>
                        <button class="btn btn-outline change-password-btn">Change Password</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for the new modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    showDashboard() {
        if (!this.currentUser) {
            showNotification('Please login to access your dashboard', 'warning');
            return;
        }

        // Check subscription status
        if (!this.isSubscriptionActive()) {
            this.showModal('subscription-modal');
            return;
        }

        // Role-specific dashboard
        switch (this.currentUser.role) {
            case 'farmer':
                this.showFarmerDashboard();
                break;
            case 'buyer':
                this.showBuyerDashboard();
                break;
            case 'transporter':
                this.showTransporterDashboard();
                break;
            default:
                showNotification('Unknown user role', 'error');
        }
    }

    showFarmerDashboard() {
        showNotification('Farmer Dashboard - Feature coming soon!', 'info');
        // Implement farmer-specific dashboard
    }

    showBuyerDashboard() {
        showNotification('Buyer Dashboard - Feature coming soon!', 'info');
        // Implement buyer-specific dashboard
    }

    showTransporterDashboard() {
        showNotification('Transporter Dashboard - Feature coming soon!', 'info');
        // Implement transporter-specific dashboard
    }

    showSubscription() {
        this.showModal('subscription-modal');
    }

    checkTrialStatus() {
        const trialStart = localStorage.getItem('trial-start');
        if (!trialStart) {
            // First time user - start trial
            localStorage.setItem('trial-start', new Date().toISOString());
            this.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            localStorage.setItem('trial-end', this.trialEndDate.toISOString());
        } else {
            const trialEnd = localStorage.getItem('trial-end');
            this.trialEndDate = new Date(trialEnd);
        }
    }

    isTrialActive() {
        return new Date() < this.trialEndDate;
    }

    isSubscriptionActive() {
        const subscription = localStorage.getItem('subscription-active');
        return subscription === 'true' || this.isTrialActive();
    }

    updateUI() {
        const authLinks = document.getElementById('auth-links');
        const userMenu = document.getElementById('user-menu');

        if (this.currentUser) {
            // User is logged in
            if (authLinks) authLinks.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                const userName = userMenu.querySelector('.user-name');
                if (userName) userName.textContent = this.currentUser.name;
            }
        } else {
            // User is not logged in
            if (authLinks) authLinks.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
