// Collection products data
// =============== FLASK API CONFIGURATION ===============
const API_BASE_URL = 'http://127.0.0.1:5000/api';
let isBackendConnected = false;
let currentUserId = null;

// Test backend connection
async function checkBackendConnection() {
    try {
        console.log('🔍 Checking backend connection...');
        const response = await fetch('http://127.0.0.1:5000/', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data.app);
            isBackendConnected = true;
            return true;
        }
    } catch (error) {
        console.log('⚠️ Backend not available. Using localStorage mode.');
        console.log('💡 Make sure Flask is running: python app.py');
        isBackendConnected = false;
    }
    return false;
}

// Initialize connection check
checkBackendConnection();


const collectionProducts = {
    "minimalist": [
        {
            id: 1,
            name: "Black Hoodie",
            image: "aaa.jpg",
            price: 35,
            description: "Clean minimalist design",
            details: "100% premium cotton, available in black, white, and grey. Features our signature minimalist logo on the chest. Perfect for everyday wear with any outfit."
        },
        {
            id: 2,
            name: "White Hoodie",
            image: "aaaa.jpg",
            price: 45,
            description: "Basic comfort hoodie",
            details: "Soft fleece interior, ribbed cuffs and hem. Oversized fit for maximum comfort. Available in neutral tones perfect for layering."
        }
    ],
    "streetwear": [
        {
            id: 3,
            name: "RED Street wear",
            image: "aaaaa.jpg",
            price: 55,
            description: "Urban street style",
            details: "Bold graphics, relaxed fit. Features our signature streetwear design on premium cotton. Stand out with this statement piece."
        },
        {
            id: 4,
            name: "Black Street Wear",
            image: "aaaaaa.jpg",
            price: 50,
            description: "Streetwear essential",
            details: "Water-resistant material, multiple pockets for functionality. Features our urban-inspired design with attention to detail."
        }
    ],
    "new arrivals": [
        {
            id: 5,
            name: "Liverpool T-Shirt",
            image: "liver.jpg",
            price: 70,
            description: "Latest collection",
            details: "Limited edition design",
        },
        {
            id: 11,
            name: "Barcelona T-Shirt",
            image: "barca.jpg",
            price: 70,
            description: "Latest collection",
            details: "Limited edition design from our newest collection."
        }
    ],
    "oversized fit": [
        {
            id: 6,
            name: "Oversized Men",
            image: "oversize.jpg",
            price: 40,
            description: "Comfortable oversized fit",
            details: "Relaxed silhouette, dropped shoulders. Made from soft.",
        },
        {
            id: 12,
            name: "Oversized WoMen",
            image: "oversize2.jpg",
            price: 40,
            description: "Comfortable oversized fit",
            details: " breathable cotton. Perfect for a comfortable, stylish look.",
        }
    ],
    "summer drop": [
        {
            id: 7,
            name: "Men Shirt",
            image: "shirt1.jpg",
            price: 45,
            description: "Lightweight summer wear",
            details: "Breathable fabric, perfect for hot weather."
        },
        {
            id: 13,
            name: "Women Shirt",
            image: "shirt2.jpg",
            price: 45,
            description: "Lightweight summer wear",
            details: "Features summer-inspired colors and designs. Stay cool and stylish all season long."
        }
    ],
    "everyday basics": [
        {
            id: 8,
            name: "Man Coat",
            image: "coat1.jpg",
            price: 100,
            description: "Everyday essential",
            details: "Classic fit, available in multiple colors."
        },
        {
            id: 14,
            name: "Women Coat",
            image: "coat2.jpg",
            price: 90,
            description: "Everyday essential",
            details: " Made from soft, durable cotton. The perfect foundation for any wardrobe."
        }

    ],
    "Pants": [
        {
            id: 9,
            name: "MEN pant",
            image: "a.pant.jpg",
            price: 60,
            description: "Cool pants outwear",
            details: "Classic oversized MEN pants"
        },
        {
            id: 10,
            name: "WOMEN PANTS",
            image: " b.pant.jpg",
            price: 65,
            description: "Classic WOMEN PANTS",
            details: "Classic WOMEN PANTS "
        }
    ],
    "Hats": [
        {
            id: 15,
            name: "Classic Hat",
            image: "hats1.jpg",
            price: 12,
            description: "Ofwhite Hat",
            details: "A distinctive white hat designed with Off-White's signature industrial aesthetic, featuring bold branding",
        },
        {
            id: 16,
            name: "Modern Hat",
            image: "hats2.jpg",
            price: 15,
            description: "White & Blue Hat",
            details: "A sleek, contemporary hat featuring minimalist design, innovative materials, and clean lines for today's urban fashion-forward style.",
        }
    ]
};

// Cart management
let cart = JSON.parse(localStorage.getItem("voidCart")) || [];

// User Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('voidUsers')) || [];
        this.init();
    }

    // =============== VALIDATION METHODS ===============
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    validateName(name) {
        // At least 2 characters, letters and spaces only
        const nameRegex = /^[A-Za-z\s]{2,}$/;
        return nameRegex.test(name);
    }

    init() {
        // Load current user from localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        this.updateUI();
    }

     async signUp(name, email, password) {
        // Frontend validation first
        if (!this.validateName(name)) {
            return { success: false, message: 'Name must be at least 2 characters' };
        }
        
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email' };
        }
        
        if (!this.validatePassword(password)) {
            return { success: false, message: 'Password: 8+ chars, uppercase, lowercase, number' };
        }

        // Try Flask backend first
        if (isBackendConnected) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    return { success: false, message: data.error || 'Registration failed' };
                }

                // Store user ID for backend
                currentUserId = data.user.id;
                
                // Auto login
                const loginResult = await this.login(email, password);
                return loginResult;
                
            } catch (error) {
                console.error('Backend registration error:', error);
                // Fallback to localStorage
            }
        }

        // LOCALSTORAGE FALLBACK
        if (this.users.find(user => user.email === email)) {
            return { success: false, message: 'User already exists with this email' };
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            createdAt: new Date().toISOString(),
            orders: []
        };

        this.users.push(newUser);
        localStorage.setItem('voidUsers', JSON.stringify(this.users));
        this.login(email, password);

        return { success: true, message: 'Account created (local mode)!' };
    }

    async login(email, password) {
        // Try Flask backend first
        if (isBackendConnected) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    // Fallback to localStorage
                    console.log('Backend login failed:', data.error);
                    return this.localLogin(email, password);
                }

                // Store user data from backend
                this.currentUser = data.user;
                currentUserId = data.user.id;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.updateUI();
                this.updateCartButtonStates();
                
                // Load user's cart from backend
                if (currentUserId) {
                    await this.loadBackendCart();
                }
                
                return { success: true, message: 'Login successful!' };
                
            } catch (error) {
                console.error('Backend login error:', error);
                // Fallback to localStorage
            }
        }

        // LOCALSTORAGE FALLBACK
        return this.localLogin(email, password);
    }
     async loadBackendCart() {
        if (!isBackendConnected || !currentUserId) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/cart?user_id=${currentUserId}`);
            const data = await response.json();
            
            if (response.ok && data.cart_items) {
                // Convert backend cart to frontend format
                const backendCart = data.cart_items.map(item => ({
                    name: item.product_name,
                    price: item.product_price,
                    img: item.product_image,
                    qty: item.quantity
                }));
                
                // Merge with local cart or replace
                if (cart.length === 0) {
                    cart = backendCart;
                    saveCart();
                    renderCart();
                }
            }
        } catch (error) {
            console.error('Error loading cart from backend:', error);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.updateCartButtonStates();
        return { success: true, message: 'Logged out successfully!' };
    }

    updateUserInfo(updates) {
        if (!this.currentUser) return { success: false, message: 'Not logged in' };

        // Update in users array
        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            localStorage.setItem('voidUsers', JSON.stringify(this.users));
        }

        // Update current user
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.updateUI();
        return { success: true, message: 'Profile updated successfully!' };
    }

    // FIXED: Add order to user properly
    addOrderToUser(order) {
        if (!this.currentUser) return false;

        // Update current user
        if (!this.currentUser.orders) {
            this.currentUser.orders = [];
        }
        this.currentUser.orders.unshift(order); // Add to beginning
        
        // Update in users array
        const userIndex = this.users.findIndex(user => user.id === this.currentUser.id);
        if (userIndex !== -1) {
            // Add password back for storage
            const userPassword = this.users[userIndex].password;
            const updatedUser = {
                ...this.currentUser,
                password: userPassword
            };
            this.users[userIndex] = updatedUser;
            
            // Save to localStorage
            localStorage.setItem('voidUsers', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        return true;
    }

    updateUI() {
        this.updateHeader();
        this.updateSidebar();
    }

    updateHeader() {
        const userMenuContainer = document.getElementById('userMenuContainer');

        if (this.currentUser) {
            // User is logged in - show user menu
            const firstLetter = this.currentUser.name.charAt(0).toUpperCase();
            userMenuContainer.innerHTML = `
                <div class="user-menu">
                    <div class="user-avatar" id="userAvatar">${firstLetter}</div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <a href="#" id="profileLink">Profile</a>
                        <a href="#" id="ordersLink">My Orders</a>
                        <a href="#" id="logoutLink">Logout</a>
                    </div>
                </div>
            `;

            // Add event listeners for dropdown
            const userAvatar = document.getElementById('userAvatar');
            const dropdownMenu = document.getElementById('dropdownMenu');

            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });

            // Profile link
            document.getElementById('profileLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showProfilePage();
            });

            // Orders link
            document.getElementById('ordersLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showOrdersPage();
            });

            // Logout link
            document.getElementById('logoutLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                this.showNotification('Logged out successfully!', 'success');
                this.showHomePage();
            });

        } else {
            // User is not logged in - show login/signup buttons
            userMenuContainer.innerHTML = `
            <a href="#" id="loginBtn" class="login-btn-gradient">Login</a>
            <a href="#" id="signupBtn" class="signup-btn-primary">Sign Up</a>
        `;

            document.getElementById('loginBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPage();
            });

            document.getElementById('signupBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignUpPage();
            });
        }
    }

    updateSidebar() {
        const mobileAuthLinks = document.getElementById('mobileAuthLinks');

        if (this.currentUser) {
            mobileAuthLinks.innerHTML = `
                <a href="#" id="mobileProfileLink">Profile</a>
                <a href="#" id="mobileOrdersLink">My Orders</a>
                <a href="#" id="mobileLogoutLink">Logout</a>
            `;

            document.getElementById('mobileProfileLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showProfilePage();
                document.getElementById('sidebar').classList.remove('open');
            });

            document.getElementById('mobileOrdersLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showOrdersPage();
                document.getElementById('sidebar').classList.remove('open');
            });

            document.getElementById('mobileLogoutLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
                this.showNotification('Logged out successfully!', 'success');
                this.showHomePage();
                document.getElementById('sidebar').classList.remove('open');
            });
        } else {
            mobileAuthLinks.innerHTML = `
                <a href="#" id="mobileLoginLink">Login</a>
                <a href="#" id="mobileSignupLink">Sign Up</a>
            `;

            document.getElementById('mobileLoginLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPage();
                document.getElementById('sidebar').classList.remove('open');
            });

            document.getElementById('mobileSignupLink').addEventListener('click', (e) => {
                e.preventDefault();
                this.showSignUpPage();
                document.getElementById('sidebar').classList.remove('open');
            });
        }
    }

    showLoginPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="auth-container">
                <h2>Login to Your Account</h2>
                <div id="loginMessage"></div>
                <form id="loginForm" class="auth-form">
                    <input type="email" id="loginEmail" placeholder="Email" required>
                    <div id="loginEmailError" class="error-message" style="display: none;"></div>
                    
                    <input type="password" id="loginPassword" placeholder="Password" required>
                    <div id="loginPasswordError" class="error-message" style="display: none;"></div>
                    
                    <button type="submit">Login</button>
                </form>
                <div class="auth-links">
                    Don't have an account? <a href="#" id="goToSignup">Sign Up</a>
                </div>
                <button class="back-to-home" id="backToHomeFromLogin">← Back to Home</button>
            </div>
        `;

        // Email validation
        $('#loginEmail').on('input', () => {
            const email = $('#loginEmail').val();
            const errorDiv = $('#loginEmailError');
            
            if (!this.validateEmail(email)) {
                errorDiv.text('Please enter a valid email address').show();
            } else {
                errorDiv.hide();
            }
        });

        $('#loginForm').submit((e) => {
            e.preventDefault();
            
            const email = $('#loginEmail').val();
            const password = $('#loginPassword').val();
            
            // Validate email
            if (!this.validateEmail(email)) {
                $('#loginEmailError').text('Please enter a valid email address').show();
                return;
            }
            
            // Password validation (at least 8 chars)
            if (password.length < 8) {
                $('#loginPasswordError').text('Password must be at least 8 characters').show();
                return;
            }
            
            const result = this.login(email, password);
            this.showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                setTimeout(() => this.showHomePage(), 1500);
            }
        });

        $('#goToSignup').click((e) => {
            e.preventDefault();
            this.showSignUpPage();
        });

        $('#backToHomeFromLogin').click((e) => {
            e.preventDefault();
            this.showHomePage();
        });
    }

    showSignUpPage() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="auth-container">
                <h2>Create Your Account</h2>
                <div id="signupMessage" class="info-message"></div>
                <form id="signupForm" class="auth-form">
                    <input type="text" id="signupName" placeholder="Full Name" required>
                    <div id="nameError" class="error-message" style="display: none;"></div>
                    
                    <input type="email" id="signupEmail" placeholder="Email" required>
                    <div id="emailError" class="error-message" style="display: none;"></div>
                    
                    <input type="password" id="signupPassword" placeholder="Password" required>
                    <div id="passwordError" class="error-message" style="display: none;"></div>
                    <small style="color: var(--text-secondary); display: block; margin-top: 5px;">
                        Password must be at least 8 characters with uppercase, lowercase, and number
                    </small>
                    
                    <button type="submit">Sign Up</button>
                </form>
                <div class="auth-links">
                    Already have an account? <a href="#" id="goToLogin">Login</a>
                </div>
                <button class="back-to-home" id="backToHomeFromSignup">← Back to Home</button>
            </div>
        `;

        // Real-time validation using jQuery
        $('#signupName').on('input', () => {
            const name = $('#signupName').val();
            const errorDiv = $('#nameError');
            
            if (name.length < 2) {
                errorDiv.text('Name must be at least 2 characters').show();
            } else if (!this.validateName(name)) {
                errorDiv.text('Name can only contain letters and spaces').show();
            } else {
                errorDiv.hide();
            }
        });

        $('#signupEmail').on('input', () => {
            const email = $('#signupEmail').val();
            const errorDiv = $('#emailError');
            
            if (!this.validateEmail(email)) {
                errorDiv.text('Please enter a valid email address').show();
            } else {
                errorDiv.hide();
            }
        });

        $('#signupPassword').on('input', () => {
            const password = $('#signupPassword').val();
            const errorDiv = $('#passwordError');
            
            if (!this.validatePassword(password)) {
                errorDiv.text('Password must be 8+ chars with uppercase, lowercase, and number').show();
            } else {
                errorDiv.hide();
            }
        });

        // Enhanced form submission
        $('#signupForm').submit((e) => {
            e.preventDefault();
            
            const name = $('#signupName').val();
            const email = $('#signupEmail').val();
            const password = $('#signupPassword').val();
            
            let isValid = true;
            
            // Validate all fields
            if (!this.validateName(name)) {
                $('#nameError').text('Name must be at least 2 characters (letters and spaces only)').show();
                isValid = false;
            }
            
            if (!this.validateEmail(email)) {
                $('#emailError').text('Please enter a valid email address').show();
                isValid = false;
            }
            
            if (!this.validatePassword(password)) {
                $('#passwordError').text('Password must be 8+ characters with at least one uppercase, one lowercase, and one number').show();
                isValid = false;
            }
            
            if (!isValid) {
                return;
            }
            
            const result = this.signUp(name, email, password);
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                setTimeout(() => this.showHomePage(), 1500);
            }
        });

        $('#goToLogin').click((e) => {
            e.preventDefault();
            this.showLoginPage();
        });

        $('#backToHomeFromSignup').click((e) => {
            e.preventDefault();
            this.showHomePage();
        });
    }

    showProfilePage() {
        if (!this.currentUser) {
            this.showLoginPage();
            return;
        }

        const mainContent = document.getElementById('mainContent');
        const firstLetter = this.currentUser.name.charAt(0).toUpperCase();

        mainContent.innerHTML = `
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">${firstLetter}</div>
                        <div class="profile-info">
                            <h2>${this.currentUser.name}</h2>
                            <p>${this.currentUser.email}</p>
                        </div>
                    </div>
                    
                    <div class="profile-details">
                        <h3>Account Details</h3>
                        <div class="detail-item">
                            <label>Member Since</label>
                            <span>${new Date(this.currentUser.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Orders Placed</label>
                            <span>${this.currentUser.orders ? this.currentUser.orders.length : 0}</span>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="edit-btn" id="editProfileBtn">Edit Profile</button>
                        <button class="back-to-home" id="backToHomeFromProfile">← Back to Home</button>
                        <button class="logout-btn" id="profileLogoutBtn">Logout</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.showEditProfilePage();
        });

        document.getElementById('profileLogoutBtn').addEventListener('click', () => {
            this.logout();
            this.showNotification('Logged out successfully!', 'success');
            this.showHomePage();
        });

        document.getElementById('backToHomeFromProfile').addEventListener('click', () => {
            this.showHomePage();
        });
    }

    // FIXED: Show orders with proper formatting
    showOrdersPage() {
        if (!this.currentUser) {
            this.showLoginPage();
            return;
        }

        const mainContent = document.getElementById('mainContent');
        const orders = this.currentUser.orders || [];
        
        if (orders.length === 0) {
            mainContent.innerHTML = `
                <div class="profile-container">
                    <div class="profile-card">
                        <h2 style="text-align: center; margin-bottom: 2rem;">My Orders</h2>
                        <p style="text-align: center; color: var(--text-secondary);">
                            You haven't placed any orders yet.
                        </p>
                        <div style="text-align: center; margin-top: 2rem;">
                            <button class="back-to-home" id="backToHomeFromOrders">← Back to Home</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            let ordersHTML = '';
            
            orders.forEach((order, index) => {
                const orderDate = new Date(order.date);
                ordersHTML += `
                    <div class="order-card">
                        <div class="order-header">
                            <h3 style="margin: 0; color: var(--gold);">Order #${order.id.substring(0, 8)}</h3>
                            <span class="order-date">${orderDate.toLocaleDateString()}</span>
                        </div>
                        <div class="order-payment-method">
                            <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}
                        </div>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.img}" alt="${item.name}">
                                    <div class="order-item-info">
                                        <p class="order-item-name">${item.name}</p>
                                        <p class="order-item-price">$${item.price} × ${item.qty}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="text-align: right; margin-top: 1rem;">
                            <span class="order-total">Total: $${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            });
            
            mainContent.innerHTML = `
                <div class="profile-container">
                    <div class="profile-card">
                        <h2 style="text-align: center; margin-bottom: 2rem;">My Orders</h2>
                        <div style="margin-bottom: 1.5rem; color: var(--text-secondary); text-align: center;">
                            You have ${orders.length} order${orders.length === 1 ? '' : 's'}
                        </div>
                        ${ordersHTML}
                        <div style="text-align: center; margin-top: 2rem;">
                            <button class="back-to-home" id="backToHomeFromOrders">← Back to Home</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('backToHomeFromOrders').addEventListener('click', () => {
            this.showHomePage();
        });
    }

    showEditProfilePage() {
        const mainContent = document.getElementById('mainContent');

        mainContent.innerHTML = `
            <div class="auth-container">
                <h2>Edit Profile</h2>
                <div id="editMessage"></div>
                <form id="editForm" class="auth-form">
                    <input type="text" id="editName" placeholder="Full Name" value="${this.currentUser.name}" required>
                    <input type="email" id="editEmail" placeholder="Email" value="${this.currentUser.email}" required>
                    <button type="submit">Update Profile</button>
                </form>
                <div class="auth-links">
                    <a href="#" id="cancelEdit">Cancel</a>
                </div>
            </div>
        `;

        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('editName').value;
            const email = document.getElementById('editEmail').value;

            const result = this.updateUserInfo({ name, email });
            this.showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                this.showProfilePage();
            }
        });

        document.getElementById('cancelEdit').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfilePage();
        });
    }

    showHomePage() {
        // Reload the home page content
        location.reload();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = type === 'error' ? 'error-message' : type === 'success' ? 'success-message' : 'info-message';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 4000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    updateCartButtonStates() {
        const isLoggedIn = this.currentUser !== null;
        const allAddToCartButtons = document.querySelectorAll('.add-to-cart');
        
        allAddToCartButtons.forEach(button => {
            if (!isLoggedIn) {
                button.disabled = true;
                button.title = "Please login to add to cart";
                button.textContent = "Login to Add";
            } else {
                button.disabled = false;
                button.title = "";
                button.textContent = "Add to Cart";
            }
        });
    }
}

// Initialize Auth System
const authSystem = new AuthSystem();

// Update checkout summary function
function updateCheckoutSummary() {
    const itemCount = cart.reduce((total, item) => total + item.qty, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
    
    if (document.getElementById('itemCount')) {
        document.getElementById('itemCount').textContent = itemCount;
    }
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    }
    if (document.getElementById('orderTotal')) {
        document.getElementById('orderTotal').textContent = subtotal.toFixed(2);
    }
}

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    // Home button functionality
    const homeLink = document.getElementById('homeLink');
    const mobileHomeLink = document.getElementById('mobileHomeLink');
    
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('home').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
    
    if (mobileHomeLink) {
        mobileHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('home').scrollIntoView({ 
                behavior: 'smooth' 
            });
            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
        });
    }

    // Smooth scroll to collections
    const shopBtn = document.getElementById("shopBtn");
    const collectionsSection = document.getElementById("collections");

    if (shopBtn) {
        shopBtn.addEventListener("click", () => {
            collectionsSection.scrollIntoView({ behavior: "smooth" });
        });
    }

    // Enhanced contact form validation
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        $(contactForm).on('submit', function(e) {
            e.preventDefault();
            
            const name = $('#contactForm input[name="name"]').val().trim();
            const email = $('#contactForm input[name="email"]').val().trim();
            const message = $('#contactForm textarea[name="message"]').val().trim();
            
            let isValid = true;
            
            // Name validation
            if (name.length < 2) {
                $('#contactNameError').text('Name must be at least 2 characters').show();
                isValid = false;
            } else {
                $('#contactNameError').hide();
            }
            
            // Email validation
            if (!authSystem.validateEmail(email)) {
                $('#contactEmailError').text('Please enter a valid email address').show();
                isValid = false;
            } else {
                $('#contactEmailError').hide();
            }
            
            // Message validation
            if (message.length < 10) {
                $('#contactMessageError').text('Message must be at least 10 characters').show();
                isValid = false;
            } else {
                $('#contactMessageError').hide();
            }
            
            if (!isValid) {
                return;
            }
            
            // Simulate AJAX submission with jQuery
            $('#contactMessage').text('Sending message...').show();
            
            $.ajax({
                url: 'https://jsonplaceholder.typicode.com/posts',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: name,
                    email: email,
                    message: message,
                    userId: 1
                }),
                success: function(response) {
                    $('#contactMessage').text('Message sent successfully!').removeClass('info-message').addClass('success-message').show();
                    contactForm.reset();
                    
                    setTimeout(() => {
                        $('#contactMessage').hide();
                    }, 3000);
                },
                error: function() {
                    // Fallback if API fails
                    $('#contactMessage').text('Message sent! (Demo mode)').removeClass('info-message').addClass('success-message').show();
                    contactForm.reset();
                    
                    setTimeout(() => {
                        $('#contactMessage').hide();
                    }, 3000);
                }
            });
        });
    }

    // Dark mode
    const darkToggle = document.getElementById("darkToggle");
    const darkToggleMobile = document.getElementById("darkToggleMobile");

    function toggleDarkMode() {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        darkToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
        if (darkToggleMobile) {
            darkToggleMobile.textContent = isDark ? "Light Mode" : "Dark Mode";
        }
    }

    darkToggle.addEventListener("click", toggleDarkMode);
    if (darkToggleMobile) {
        darkToggleMobile.addEventListener("click", toggleDarkMode);
    }

    // Sidebar
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");
    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Collection click handlers
    document.querySelectorAll('.card-collection').forEach(card => {
        card.addEventListener('click', () => {
            const collectionName = card.dataset.collection;
            showCollectionGallery(collectionName);
        });
    });

    // Back to collections
    const backBtn = document.querySelector('.back-to-collections');
    if (backBtn) {
        backBtn.addEventListener('click', backToCollections);
    }

    // Close product modal
    const closeProductModalBtn = document.getElementById('close-product-modal');
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                closeProductModal();
            }
        });
    }

    // Initialize cart functionality
    initCart();

    // Update cart button states on page load
    authSystem.updateCartButtonStates();

    // Update checkout summary
    updateCheckoutSummary();

    // Fade-in animation
    const fadeElements = document.querySelectorAll(".fade-in");
    function revealOnScroll() {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add("show");
            }
        });
    }
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();
});

// Collection Gallery Functions
function showCollectionGallery(collectionName) {
    // Hide collections section
    document.getElementById('collections').style.display = 'none';

    // Show gallery section
    const gallerySection = document.getElementById('collection-gallery');
    const galleryTitle = document.getElementById('gallery-title');
    const galleryProducts = document.getElementById('gallery-products');

    gallerySection.style.display = 'block';
    const customTitles = {
        "hoodie": "HOODIES",
        "streetwear": "Streetwear Collection",
        "new arrivals": "Sports Wear",
        "oversized fit": "Oversized Collection",
        "summer drop": "SHIRTS",
        "everyday basics": "COATS",
        "Pants": "PANTS",
        "Hats": "HATS",
    };

    galleryTitle.textContent = customTitles[collectionName] || collectionName.charAt(0).toUpperCase() + collectionName.slice(1);

    // Clear previous products
    galleryProducts.innerHTML = '';

    // Add products to gallery
    if (collectionProducts[collectionName]) {
        collectionProducts[collectionName].forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'gallery-item';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="content">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <p class="price">$${product.price}</p>
                    <button class="add-to-cart" 
                            data-name="${product.name}" 
                            data-price="${product.price}" 
                            data-img="${product.image}">
                        Add to Cart
                    </button>
                </div>
            `;

            // Click to show product details
            productElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart')) {
                    showProductDetails(product);
                }
            });

            galleryProducts.appendChild(productElement);
        });
    }

    // Add event listeners for the new Add to Cart buttons
    document.querySelectorAll('#gallery-products .add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the product details
            addItemToCart(
                btn.dataset.name,
                Number(btn.dataset.price),
                btn.dataset.img
            );
        });
    });

    // Update cart button states for new buttons
    authSystem.updateCartButtonStates();

    // Scroll to gallery section
    gallerySection.scrollIntoView({ behavior: 'smooth' });
}

function backToCollections() {
    // Hide gallery section
    document.getElementById('collection-gallery').style.display = 'none';

    // Show collections section
    document.getElementById('collections').style.display = 'block';

    // Scroll to collections
    document.getElementById('collections').scrollIntoView({ behavior: 'smooth' });
}

function showProductDetails(product) {
    const modal = document.getElementById('product-modal');
    const productName = document.getElementById('modal-product-name');
    const productImage = document.getElementById('modal-product-image');
    const productDetails = document.getElementById('modal-product-details');

    // Set product details
    productName.textContent = product.name;
    productImage.src = product.image;
    productImage.alt = product.name;

    // Product details
    productDetails.innerHTML = `
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Details:</strong> ${product.details}</p>
        <p><strong>Price:</strong> $${product.price}</p>
    `;

    // Add to cart button functionality
    const addToCartBtn = document.getElementById('add-to-cart-from-modal');
    addToCartBtn.onclick = () => {
        addItemToCart(product.name, product.price, product.image);
        closeProductModal();
    };

    // Show modal
    modal.style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}


// =============== PARALLAX FLOATING IMAGE ===============

// Initialize parallax effect
function initParallaxFloating() {
    const parallaxImage = document.getElementById('parallaxImage');
    if (!parallaxImage) return;
    
    // Mouse move parallax
    document.addEventListener('mousemove', (e) => {
        if (!parallaxImage) return;
        
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        parallaxImage.style.transform = `
            perspective(1000px)
            rotateY(${x}deg)
            rotateX(${-y}deg)
            translateZ(20px)
        `;
        
        // Update CSS variables for other elements
        document.documentElement.style.setProperty('--mouse-x', `${x}px`);
        document.documentElement.style.setProperty('--mouse-y', `${y}px`);
    });
    
    // Scroll parallax
    window.addEventListener('scroll', () => {
        if (!parallaxImage) return;
        
        const scrollY = window.scrollY;
        const parallaxY = scrollY * 0.3; // Adjust this value for intensity
        const parallaxRotate = scrollY * 0.01; // Gentle rotation
        
        parallaxImage.style.setProperty('--parallax-y', `${parallaxY}px`);
        parallaxImage.style.setProperty('--parallax-rotate', `${parallaxRotate}deg`);
        
        // Add/remove parallax class based on scroll
        if (scrollY > 100) {
            parallaxImage.classList.add('parallax-active');
        } else {
            parallaxImage.classList.remove('parallax-active');
        }
    });
    
    // Interactive dots click handler
    const interactiveDots = document.querySelectorAll('.interactive-dot');
    interactiveDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const tooltip = this.getAttribute('data-tooltip');
            showFloatingNotification(`✓ ${tooltip}`, 'success');
            
            // Add pulse effect
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'pulseDot 2s ease-in-out infinite';
            }, 10);
        });
    });
    
    // Animate stats counter
    animateStats();
    
    // Initialize scroll indicator
    initScrollIndicator();
}

// Animate counting stats
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 16);
    });
}

// Initialize scroll indicator
function initScrollIndicator() {
    const scrollDots = document.querySelectorAll('.scroll-dot');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        // Update dots
        scrollDots.forEach((dot, index) => {
            dot.classList.remove('active');
            
            // Simple logic: first dot for hero, second for collections, third for products
            if (current === 'home' && index === 0) {
                dot.classList.add('active');
            } else if (current === 'collections' && index === 1) {
                dot.classList.add('active');
            } else if ((current === 'products' || current === 'testimonials') && index === 2) {
                dot.classList.add('active');
            } else if (!current && index === 0) {
                dot.classList.add('active');
            }
        });
    });
}

// Enhanced floating notification
function showFloatingNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: var(--bg-card);
        color: var(--text-main);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px var(--shadow);
        border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--info)'};
        z-index: 9999;
        animation: slideInRight 0.3s ease, floatNotification 2s ease-in-out infinite;
        max-width: 300px;
        backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span style="font-weight: 600;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initParallaxFloating();
    
    // Add floating effect to existing elements
    const addFloatingEffect = () => {
        // Add subtle float to all product cards
        document.querySelectorAll('.card-product, .floating-product').forEach(card => {
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    };
    
    addFloatingEffect();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes floatNotification {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
    }
`;
document.head.appendChild(style);

// Cart functionality
function initCart() {
    const cartToggle = document.getElementById("cartToggle");
    const cartSidebar = document.getElementById("cartSidebar");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const checkoutModal = document.getElementById("checkoutModal");
    const closeCheckout = document.getElementById("closeCheckout");
    const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
    const checkoutLoading = document.getElementById("checkoutLoading");
    const checkoutSuccess = document.getElementById("checkoutSuccess");
    const checkoutActions = document.getElementById("checkoutActions");

    // Toggle Cart
    cartToggle.addEventListener("click", () => {
        cartSidebar.classList.toggle("open");
        // Update checkout summary when cart opens
        updateCheckoutSummary();
    });

    // Add to Cart from main products
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const product = e.target.closest("[data-name]");
            const name = product.dataset.name;
            const price = Number(product.dataset.price);
            const img = product.dataset.img;

            addItemToCart(name, price, img);
            // Update checkout summary
            updateCheckoutSummary();
        });
    });

    // Checkout modal
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            authSystem.showNotification("Your cart is empty!", "error");
            return;
        }

        // Check if user is logged in
        if (!authSystem.currentUser) {
            authSystem.showNotification("Please login to checkout!", "error");
            authSystem.showLoginPage();
            return;
        }

        // Update checkout summary before showing
        updateCheckoutSummary();
        checkoutModal.classList.add("open");
        
        // Reset states
        checkoutLoading.style.display = 'none';
        checkoutSuccess.style.display = 'none';
        checkoutActions.style.display = 'block';
    });

    closeCheckout.addEventListener("click", () => {
        checkoutModal.classList.remove("open");
    });

    // Enhanced checkout confirmation
    confirmPaymentBtn.addEventListener("click", () => {
        const method = document.querySelector('input[name="payment"]:checked').value;
        
        // Show loading state
        checkoutActions.style.display = 'none';
        checkoutLoading.style.display = 'block';
        
        // Simulate processing delay
        setTimeout(() => {
            // Create order object
            const order = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                items: [...cart],
                total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
                paymentMethod: method
            };

            // Add order to user's history
            const orderAdded = authSystem.addOrderToUser(order);
            
            if (orderAdded) {
                // Show success state
                checkoutLoading.style.display = 'none';
                checkoutSuccess.style.display = 'block';
                
                // Wait a moment then close
                setTimeout(() => {
                    authSystem.showNotification(`Purchase confirmed via ${method.toUpperCase()}! Order saved.`, "success");
                    
                    // Clear cart
                    cart = [];
                    saveCart();
                    renderCart();
                    checkoutModal.classList.remove("open");
                    
                    // Close cart sidebar
                    cartSidebar.classList.remove("open");
                }, 1500);
            } else {
                authSystem.showNotification("Failed to save order. Please try again.", "error");
                checkoutLoading.style.display = 'none';
                checkoutActions.style.display = 'block';
            }
        }, 1500);
    });

    // Initial render
    renderCart();
}

async function addItemToCart(name, price, img) {
    // Check if user is logged in
    if (!authSystem.currentUser) {
        authSystem.showNotification("Please login to add items to cart!", "error");
        authSystem.showLoginPage();
        return;
    }

    // Find product ID from backend
    let productId = null;
    if (isBackendConnected) {
        try {
            // Search for product in backend
            const response = await fetch(`${API_BASE_URL}/products`);
            const data = await response.json();
            
            if (response.ok) {
                const product = data.products.find(p => p.name === name);
                if (product) {
                    productId = product.id;
                }
            }
        } catch (error) {
            console.error('Error finding product:', error);
        }
    }

    // Add to backend cart if connected
    if (isBackendConnected && currentUserId && productId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: currentUserId,
                    product_id: productId,
                    quantity: 1
                })
            });
            
            if (!response.ok) {
                console.error('Failed to add to backend cart');
            }
        } catch (error) {
            console.error('Error adding to backend cart:', error);
        }
    }

    // Also add to local cart
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }

    saveCart();
    renderCart();
    authSystem.showNotification(`${name} added to cart!`, 'success');
    updateCheckoutSummary();
}

function saveCart() {
    localStorage.setItem("voidCart", JSON.stringify(cart));
}

function renderCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItemsContainer || !cartTotal) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;

        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
                <p style="margin: 0 0 10px 0;">$${item.price}</p>
                <div class="qty">
                    <button data-i="${index}" class="dec">-</button>
                    <span>${item.qty}</span>
                    <button data-i="${index}" class="inc">+</button>
                </div>
            </div>
            <button class="remove" data-i="${index}">✖</button>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotal.textContent = total.toFixed(2);

    // Reattach event listeners
    document.querySelectorAll(".inc").forEach(btn => {
        btn.addEventListener("click", () => {
            cart[btn.dataset.i].qty++;
            saveCart();
            renderCart();
            updateCheckoutSummary();
        });
    });

    document.querySelectorAll(".dec").forEach(btn => {
        btn.addEventListener("click", () => {
            if (cart[btn.dataset.i].qty > 1) cart[btn.dataset.i].qty--;
            else cart.splice(btn.dataset.i, 1);
            saveCart();
            renderCart();
            updateCheckoutSummary();
        });
    });

    document.querySelectorAll(".remove").forEach(btn => {
        btn.addEventListener("click", () => {
            cart.splice(btn.dataset.i, 1);
            saveCart();
            renderCart();
            updateCheckoutSummary();
        });
    });
    
    // Update checkout summary
    updateCheckoutSummary();
}