// Mobile E-Commerce App - Complete Implementation
class LemonadeApp {
    constructor() {
        this.cart = [];
        this.cartCount = 0;
        this.currentUser = null;
        this.currentTheme = 'light';
        this.products = [];
        this.baseURL = 'http://localhost:5000';
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadCartFromStorage();
        this.loadUserPreferences();
        this.loadProducts();
        this.setupEventListeners();
        this.setupCheckoutListeners();
        this.setupAccountNavigation();
         this.setupProductDetailListeners(); // ADD THIS LINE
        this.updateUI();
    }

    // Setup checkout listeners
    setupCheckoutListeners() {
        const confirmPaymentBtn = document.getElementById('confirm-payment');
        const cancelCheckoutBtn = document.getElementById('cancel-checkout');
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', () => {
                this.processPayment();
            });
        }
        
        if (cancelCheckoutBtn) {
            cancelCheckoutBtn.addEventListener('click', () => {
                this.hideMpesaModal();
            });
        }
        
        // Payment method change handler
        if (paymentMethods.length > 0) {
            paymentMethods.forEach(method => {
                method.addEventListener('change', (e) => {
                    const selectedMethod = e.target.value;
                    const mpesaFields = document.getElementById('mpesa-fields');
                    const cashFields = document.getElementById('cash-fields');
                    
                    if (selectedMethod === 'mpesa') {
                        if (mpesaFields) mpesaFields.style.display = 'block';
                        if (cashFields) cashFields.style.display = 'none';
                    } else if (selectedMethod === 'cash') {
                        if (mpesaFields) mpesaFields.style.display = 'none';
                        if (cashFields) cashFields.style.display = 'block';
                    }
                    
                    this.updateConfirmButton(selectedMethod);
                });
            });
        }
    }

    // Setup account navigation
    setupAccountNavigation() {
        document.addEventListener('click', (e) => {
            // Handle account menu items
            if (e.target.closest('.menu-item') && e.target.closest('#user-menu')) {
                const menuItem = e.target.closest('.menu-item');
                if (menuItem.onclick) return;
                
                const text = menuItem.textContent.toLowerCase();
                if (text.includes('profile')) {
                    this.showSection('profile');
                } else if (text.includes('address')) {
                    this.showSection('address');
                } else if (text.includes('order') || text.includes('history')) {
                    this.showSection('order-history');
                } else if (text.includes('notification')) {
                    this.showSection('notifications');
                }
            }
            
            // Handle back buttons
            if (e.target.closest('.back-btn')) {
                this.showSection('main');
            }
        });
    }




    // Add this to your LemonadeApp class in script.js

setupProductDetailListeners() {
    // Back to products button
    const backButton = document.getElementById('back-to-products');
    if (backButton) {
        backButton.addEventListener('click', () => {
            this.hideProductDetail();
            this.switchView('home-view');
        });
    }

    // Cart button in detail view
    const cartButtonDetail = document.getElementById('cart-button-detail');
    if (cartButtonDetail) {
        cartButtonDetail.addEventListener('click', () => {
            this.switchView('cart-view');
        });
    }

    // Add to cart in detail view
    const addToCartDetail = document.getElementById('add-to-cart-detail');
    if (addToCartDetail) {
        addToCartDetail.addEventListener('click', () => {
            this.addToCartFromDetail();
        });
    }

    // Buy now button
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            this.buyNowFromDetail();
        });
    }

    // Quantity buttons in detail view
    document.addEventListener('click', (e) => {
        if (e.target.closest('#product-detail-view .quantity-btn')) {
            this.handleDetailQuantityChange(e);
        }
    });
}

// Add these methods to your LemonadeApp class
showProductDetail(product) {
    const detailView = document.getElementById('product-detail-view');
    if (!detailView) return;

    // Populate product details
    document.getElementById('product-detail-title').textContent = product.name;
    document.getElementById('product-detail-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('product-detail-description').textContent = product.description;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-stock').textContent = product.stock > 0 ? 'In Stock' : 'Out of Stock';
    
    // Set main image
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = product.image;
        mainImage.alt = product.name;
    }

    // Show the detail view
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    detailView.style.display = 'block';
    
    // Update cart badge
    this.updateCartBadgeDetail();
}

hideProductDetail() {
    const detailView = document.getElementById('product-detail-view');
    if (detailView) {
        detailView.style.display = 'none';
    }
}

updateCartBadgeDetail() {
    const cartBadgeDetail = document.getElementById('cart-badge-detail');
    if (cartBadgeDetail) {
        cartBadgeDetail.textContent = this.cartCount;
    }
}

addToCartFromDetail() {
    const productTitle = document.getElementById('product-detail-title').textContent;
    const productPrice = parseFloat(document.getElementById('product-detail-price').textContent.replace('$', ''));
    const quantity = parseInt(document.querySelector('#product-detail-view .quantity-display').textContent);
    
    // Find the actual product from your products array
    const product = this.products.find(p => p.name === productTitle);
    
    if (product) {
        this.addToCart(product.id, product.name, product.price, quantity);
        this.showMessage(`${quantity} ${product.name}(s) added to cart! 🎉`);
        this.updateCartBadgeDetail();
    }
}

handleDetailQuantityChange(e) {
    const quantityDisplay = document.querySelector('#product-detail-view .quantity-display');
    let quantity = parseInt(quantityDisplay.textContent);
    
    if (e.target.classList.contains('plus')) {
        quantity++;
    } else if (e.target.classList.contains('minus') && quantity > 1) {
        quantity--;
    }
    
    quantityDisplay.textContent = quantity;
}

buyNowFromDetail() {
    this.addToCartFromDetail();
    this.hideProductDetail();
    this.initiateCheckout();
}
    // Product Management
    loadProducts() {
        this.fetchProductsFromBackend();
    }

    async fetchProductsFromBackend() {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            const data = await response.json();
            if (data.success) {
                this.products = data.products;
            } else {
                this.products = [];
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            this.products = [];
        } finally {
            this.renderProducts();
        }
    }

// In renderProducts() method, ensure this part:
renderProducts() {
    const productsContainer = document.querySelector('.products');
    if (!productsContainer) return;

    productsContainer.innerHTML = this.products
        .filter(product => product.status === 'active')
        .map(product => `
        <div class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}" data-tags="${product.tags}">
            <img src="${this.getFullImageUrl(product.image)}" alt="${product.name}" 
                 onerror="this.src='https://via.placeholder.com/300x200/fff9c4/ff6f00?text=🍋+Product'">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">$${product.price.toFixed(2)}</div>
            ${product.stock > 0 ? `
                <div class="quantity-selector">
                    <button class="quantity-btn minus" type="button">-</button>
                    <span class="quantity">1</span>
                    <button class="quantity-btn plus" type="button">+</button>
                </div>
                <button class="add-to-cart" data-product="${product.name}" data-price="${product.price}" data-id="${product.id}">
                    Add to Cart
                </button>
            ` : `
                <button class="add-to-cart out-of-stock" disabled>
                    Out of Stock
                </button>
            `}
        </div>
    `).join('');

    this.setupProductInteractions();
}

// Add this helper method to handle image URLs
getFullImageUrl(imagePath) {
    if (!imagePath) {
        return 'https://via.placeholder.com/300x200/fff9c4/ff6f00?text=🍋+Product';
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    
    // For relative paths, prepend the base URL
    return `${this.baseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}
    setupProductInteractions() {
        // Quantity buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                const productCard = e.target.closest('.product-card');
                const quantityElement = productCard.querySelector('.quantity');
                let quantity = parseInt(quantityElement.textContent);
                
                if (e.target.classList.contains('plus')) {
                    quantity++;
                } else if (e.target.classList.contains('minus') && quantity > 1) {
                    quantity--;
                }
                
                quantityElement.textContent = quantity;
            }
        });

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') && !e.target.disabled) {
                const productCard = e.target.closest('.product-card');
                const productName = e.target.getAttribute('data-product');
                const productId = parseInt(e.target.getAttribute('data-id'));
                const price = parseFloat(e.target.getAttribute('data-price'));
                const quantity = parseInt(productCard.querySelector('.quantity').textContent);
                
                this.addToCart(productId, productName, price, quantity);
                this.showMessage(`${quantity} ${productName}(s) added to cart! 🎉`);
                
                // Reset quantity to 1
                productCard.querySelector('.quantity').textContent = '1';
            }
        });
    }

    // Cart Management
    addToCart(productId, productName, price, quantity) {
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ 
                id: productId,
                product: productName, 
                price: price, 
                quantity: quantity
            });
        }
        
        this.cartCount += quantity;
        this.updateCartDisplay();
        this.saveCartToStorage();
    }

    removeFromCart(itemId) {
        const itemIndex = this.cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            const removedItem = this.cart[itemIndex];
            this.cartCount -= removedItem.quantity;
            this.cart.splice(itemIndex, 1);
            this.updateCartDisplay();
            this.saveCartToStorage();
            this.showMessage(`${removedItem.product} removed from cart!`);
        }
    }

    clearCart() {
        this.cart = [];
        this.cartCount = 0;
        this.updateCartDisplay();
        this.saveCartToStorage();
        this.showMessage('Cart cleared! 🧹');
    }

    updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('#cart-count, #bottom-cart-count');
        cartCountElements.forEach(element => {
            if (element) element.textContent = this.cartCount;
        });
        
        if (document.getElementById('cart-view')?.classList.contains('active')) {
            this.updateCartView();
        }
    }

    updateCartView() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const cartTotalElement = document.getElementById('cart-total-amount');
        if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
        
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.product}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-id="${item.id}" type="button">Remove</button>
                </div>
            </div>
        `).join('') || '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Your cart is empty</p>';

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.getAttribute('data-id'));
                this.removeFromCart(itemId);
                this.updateCartView();
            });
        });
    }

    // Checkout Functions
    initiateCheckout() {
        if (this.cart.length === 0) {
            this.showMessage('Your cart is empty! 🛒');
            return;
        }

        if (!this.currentUser) {
            this.showMessage('Please sign in to complete your order');
            this.switchView('account-view');
            return;
        }

        this.showMpesaCheckout();
    }

    showMpesaCheckout() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const summaryHTML = `
            <div class="checkout-summary">
                <h3 style="margin-bottom: 0.5rem;">Order Summary</h3>
                ${this.cart.map(item => `
                    <div class="checkout-item">
                        <span>${item.product} × ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="checkout-total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
        `;

        const checkoutSummary = document.getElementById('checkout-summary');
        const checkoutUserName = document.getElementById('checkout-user-name');
        
        if (checkoutSummary) checkoutSummary.innerHTML = summaryHTML;
        if (checkoutUserName) checkoutUserName.textContent = this.currentUser.name;
        
        this.setupCheckoutAddress();
        
        // Reset payment method to M-Pesa
        const mpesaRadio = document.getElementById('payment-mpesa');
        if (mpesaRadio) mpesaRadio.checked = true;
        
        const mpesaFields = document.getElementById('mpesa-fields');
        const cashFields = document.getElementById('cash-fields');
        if (mpesaFields) mpesaFields.style.display = 'block';
        if (cashFields) cashFields.style.display = 'none';
        
        // Pre-fill phone
        const phoneInput = document.getElementById('checkout-phone');
        if (phoneInput) phoneInput.value = this.currentUser.phone || '';
        
        // Reset terms agreement
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox) termsCheckbox.checked = false;
        
        this.showMpesaModal();
    }

    setupCheckoutAddress() {
        const savedAddressDisplay = document.getElementById('saved-address-display');
        const addressInputSection = document.getElementById('address-input-section');
        const savedAddressText = document.getElementById('saved-address-text');
        
        // Reset forms
        const addressInput = document.getElementById('checkout-address');
        const cityInput = document.getElementById('checkout-city');
        const landmarkInput = document.getElementById('checkout-landmark');
        const notesInput = document.getElementById('delivery-notes');
        
        if (addressInput) addressInput.value = '';
        if (cityInput) cityInput.value = '';
        if (landmarkInput) landmarkInput.value = '';
        if (notesInput) notesInput.value = '';

        if (this.currentUser.address && savedAddressDisplay && addressInputSection) {
            savedAddressDisplay.style.display = 'block';
            addressInputSection.style.display = 'none';
            
            const addressText = typeof this.currentUser.address === 'string' 
                ? this.currentUser.address 
                : this.currentUser.address.fullAddress;
                
            if (savedAddressText) savedAddressText.textContent = addressText;
        } else if (savedAddressDisplay && addressInputSection) {
            savedAddressDisplay.style.display = 'none';
            addressInputSection.style.display = 'block';
        }
    }

    changeAddress() {
        const savedAddressDisplay = document.getElementById('saved-address-display');
        const addressInputSection = document.getElementById('address-input-section');
        
        if (savedAddressDisplay) savedAddressDisplay.style.display = 'none';
        if (addressInputSection) addressInputSection.style.display = 'block';
    }

    // Main payment processing
    async processPayment() {
        console.log('🔍 Starting payment process...');
        
        // Validate terms agreement
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showMessage('Please agree to the terms and conditions');
            return;
        }

        // Get selected payment method
        const selectedPaymentElement = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedPaymentElement) {
            this.showMessage('Please select a payment method');
            return;
        }
        const selectedPayment = selectedPaymentElement.value;
        
        // Validate cart
        if (this.cart.length === 0) {
            this.showMessage('Your cart is empty!');
            return;
        }

        if (!this.currentUser) {
            this.showMessage('Please log in to complete your order');
            this.hideMpesaModal();
            this.switchView('account-view');
            return;
        }

        // Get delivery address
        let deliveryAddress = '';
        let addressToSave = null;
        
        const savedAddressDisplay = document.getElementById('saved-address-display');
        if (savedAddressDisplay && savedAddressDisplay.style.display !== 'none') {
            const savedAddressText = document.getElementById('saved-address-text');
            if (savedAddressText) {
                deliveryAddress = savedAddressText.textContent;
            }
        } else {
            const address = document.getElementById('checkout-address')?.value.trim() || '';
            const city = document.getElementById('checkout-city')?.value.trim() || '';
            
            if (!address || !city) {
                this.showMessage('Please enter delivery address and city');
                return;
            }
            
            const landmark = document.getElementById('checkout-landmark')?.value.trim() || '';
            deliveryAddress = `${address}${landmark ? ` (Near ${landmark})` : ''}, ${city}`;
            
            const notes = document.getElementById('delivery-notes')?.value.trim() || '';
            if (notes) {
                deliveryAddress += ` - ${notes}`;
            }
            
            addressToSave = {
                street: address,
                landmark: landmark,
                city: city,
                fullAddress: deliveryAddress
            };
        }

        // Validate M-Pesa phone if selected
        if (selectedPayment === 'mpesa') {
            const phone = document.getElementById('checkout-phone')?.value || '';
            if (!this.validatePhone(phone)) {
                this.showMessage('Please enter a valid Kenyan phone number (07XXXXXXXX)');
                return;
            }
        }

        this.showMessage('📱 Processing your order...');

        try {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Create order data
            const orderData = {
                customerName: this.currentUser.name,
                customerPhone: selectedPayment === 'mpesa' ? document.getElementById('checkout-phone')?.value : this.currentUser.phone,
                customerEmail: this.currentUser.email,
                customerId: this.currentUser.id,
                items: this.cart,
                total: total,
                deliveryAddress: deliveryAddress,
                paymentMethod: selectedPayment,
                paymentStatus: selectedPayment === 'cash' ? 'pending_cod' : 'pending',
                status: 'pending'
            };
            
            console.log('Sending order to backend:', orderData);
            
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            console.log('Backend response:', data);
            
            if (data.success) {
                // Show success message based on payment method
                if (selectedPayment === 'mpesa') {
                    this.showMpesaConfirmation(data.order, deliveryAddress);
                } else {
                    this.showCashConfirmation(data.order, deliveryAddress);
                }
                
                // Ask to save address if new
                if (addressToSave && !this.currentUser.address) {
                    this.askToSaveAddress(addressToSave);
                }
                
                this.clearCart();
                this.hideMpesaModal();
                
                // Refresh order history
                this.loadOrderHistory();
                
            } else {
                this.showMessage('❌ Order failed: ' + (data.message || 'Please try again.'));
            }
            
        } catch (error) {
            console.error('❌ Payment error:', error);
            this.showMessage('❌ Network error. Please check your connection.');
        }
    }

    validatePhone(phone) {
        const phoneRegex = /^07[0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    showMpesaConfirmation(order, deliveryAddress) {
        const orderSummary = this.cart.map(item => 
            `${item.product} x${item.quantity}`
        ).join(', ');
        
        this.showMessage(`✅ M-Pesa Order Confirmed! Order #${order.orderNumber}. Check your phone for payment prompt.`);
        
        // Add to notifications
        this.addOrderNotification(order, deliveryAddress, 'mpesa');
        
        // Update user's last order
        this.updateUserOrderStats(order);
    }

    showCashConfirmation(order, deliveryAddress) {
        const orderSummary = this.cart.map(item => 
            `${item.product} x${item.quantity}`
        ).join(', ');
        
        this.showMessage(`✅ Cash Order Confirmed! Order #${order.orderNumber}. Please have cash ready for delivery.`);
        
        // Add to notifications
        this.addOrderNotification(order, deliveryAddress, 'cash');
        
        // Update user's last order
        this.updateUserOrderStats(order);
    }

    askToSaveAddress(address) {
        if (confirm('Would you like to save this address for faster checkout next time?')) {
            this.saveUserAddress(address);
        }
    }

    async saveUserAddress(address) {
        try {
            const response = await fetch(`http://localhost:5000/api/user/address/${this.currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: address })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser.address = address;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showMessage('✅ Address saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            // Save locally as fallback
            this.currentUser.address = address;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showMessage('✅ Address saved locally!', 'success');
        }
    }

    updateUserOrderStats(order) {
        if (!this.currentUser) return;
        
        // Update local user data
        this.currentUser.orders = (this.currentUser.orders || 0) + 1;
        this.currentUser.totalSpent = (this.currentUser.totalSpent || 0) + parseFloat(order.total);
        this.currentUser.lastOrder = new Date().toISOString();
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUserUI();
    }

    addOrderNotification(order, deliveryAddress, paymentMethod) {
        const paymentIcons = {
            'mpesa': 'fas fa-mobile-alt',
            'cash': 'fas fa-money-bill-wave',
            'card': 'fas fa-credit-card'
        };
        
        const notification = {
            id: `notif_${Date.now()}`,
            type: 'order',
            title: `Order #${order.orderNumber} Confirmed`,
            message: `Your ${paymentMethod.toUpperCase()} order is being prepared`,
            deliveryInfo: `Delivery to: ${deliveryAddress}`,
            paymentMethod: paymentMethod,
            paymentIcon: paymentIcons[paymentMethod] || 'fas fa-shopping-bag',
            timestamp: new Date().toISOString(),
            orderId: order.id
        };
        
        // Save to localStorage
        let notifications = JSON.parse(localStorage.getItem('lemonadeNotifications') || '[]');
        notifications.unshift(notification);
        localStorage.setItem('lemonadeNotifications', JSON.stringify(notifications.slice(0, 20)));
    }

    // Modal functions
    showMpesaModal() {
        const modal = document.getElementById('mpesa-modal');
        if (modal) modal.style.display = 'block';
    }

    hideMpesaModal() {
        const modal = document.getElementById('mpesa-modal');
        if (modal) modal.style.display = 'none';
    }

    updateConfirmButton(paymentMethod) {
        const confirmBtn = document.getElementById('confirm-payment');
        if (!confirmBtn) return;
        
        switch(paymentMethod) {
            case 'mpesa':
                confirmBtn.innerHTML = '<i class="fas fa-lock"></i> Pay with M-Pesa';
                break;
            case 'cash':
                confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Cash Order';
                break;
            default:
                confirmBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Order';
        }
    }

    // Account Management Methods
    showSection(sectionName) {
        // Hide all sections first
        document.querySelectorAll('.account-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const userMenu = document.getElementById('user-menu');
        const authSection = document.getElementById('auth-section');
        
        if (userMenu) userMenu.style.display = 'none';
        if (authSection) authSection.style.display = 'none';

        if (sectionName === 'main') {
            if (this.currentUser) {
                if (userMenu) userMenu.style.display = 'block';
            } else {
                if (authSection) authSection.style.display = 'block';
            }
        } else {
            const section = document.getElementById(`${sectionName}-section`);
            if (section) {
                section.style.display = 'block';
                
                // Load section-specific data
                switch(sectionName) {
                    case 'profile':
                        this.loadProfileData();
                        break;
                    case 'address':
                        this.loadAddressData();
                        break;
                    case 'order-history':
                        this.loadOrderHistory();
                        break;
                    case 'notifications':
                        this.loadNotifications();
                        break;
                }
            }
        }
    }

    showNotifications() {
        this.showSection('notifications');
    }

    async loadOrderHistory() {
        if (!this.currentUser) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/user/orders/${this.currentUser.id}`);
            const data = await response.json();
            
            const ordersHistory = document.getElementById('orders-history');
            if (!ordersHistory) return;
            
            if (data.success && data.orders && data.orders.length > 0) {
                ordersHistory.innerHTML = data.orders.map(order => `
                    <div class="order-history-item">
                        <div class="order-header">
                            <div class="order-info">
                                <h4>Order #${order.orderNumber || order.id}</h4>
                                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div class="order-status status-${order.status}">
                                ${this.formatOrderStatus(order.status)}
                            </div>
                        </div>
                        <div class="order-items">
                            ${order.items ? order.items.map(item => `
                                <div class="order-item">
                                    <span class="item-name">${item.product} x${item.quantity}</span>
                                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('') : 'No items information'}
                        </div>
                        <div class="order-footer">
                            <div class="order-total">
                                Total: $${parseFloat(order.total || 0).toFixed(2)}
                            </div>
                            ${order.deliveryAddress ? `
                                <div class="order-address">
                                    <small>Delivery to: ${order.deliveryAddress}</small>
                                </div>
                            ` : ''}
                            ${order.paymentMethod ? `
                                <div class="order-payment">
                                    <small>Payment: ${order.paymentMethod.toUpperCase()}</small>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                ordersHistory.innerHTML = `
                    <div class="no-orders">
                        <i class="fas fa-shopping-bag"></i>
                        <p>No orders yet</p>
                        <small>Your order history will appear here</small>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading order history:', error);
            const ordersHistory = document.getElementById('orders-history');
            if (ordersHistory) {
                ordersHistory.innerHTML = `
                    <div class="no-orders">
                        <p>Error loading order history</p>
                    </div>
                `;
            }
        }
    }

    formatOrderStatus(status) {
        const statusMap = {
            'pending': '⏳ Pending',
            'confirmed': '✅ Confirmed',
            'preparing': '👨‍🍳 Preparing',
            'ready': '📦 Ready for Pickup',
            'completed': '🚚 Delivered',
            'cancelled': '❌ Cancelled'
        };
        return statusMap[status] || status;
    }

    loadNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        try {
            const notifications = JSON.parse(localStorage.getItem('lemonadeNotifications') || '[]');
            
            if (notifications.length > 0) {
                notificationsList.innerHTML = notifications.map(notification => `
                    <div class="notification-item">
                        <div class="notification-icon">
                            <i class="${notification.paymentIcon || 'fas fa-bell'}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notification.title}</h4>
                            <p>${notification.message}</p>
                            ${notification.deliveryInfo ? `<small>${notification.deliveryInfo}</small>` : ''}
                            <div class="notification-time">${new Date(notification.timestamp).toLocaleString()}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                notificationsList.innerHTML = `
                    <div class="no-notifications">
                        <i class="fas fa-bell-slash"></i>
                        <p>No notifications</p>
                        <small>You'll get notifications about your orders here</small>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <p>Error loading notifications</p>
                </div>
            `;
        }
    }

    loadProfileData() {
        if (!this.currentUser) return;
        
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profilePhone = document.getElementById('profile-phone');
        
        if (profileName) profileName.value = this.currentUser.name || '';
        if (profileEmail) profileEmail.value = this.currentUser.email || '';
        if (profilePhone) profilePhone.value = this.currentUser.phone || '';
        
        // Setup profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.onsubmit = (e) => {
                e.preventDefault();
                this.updateProfile();
            };
        }
    }

    async updateProfile() {
        if (!this.currentUser) return;
        
        const name = document.getElementById('profile-name')?.value.trim() || '';
        const email = document.getElementById('profile-email')?.value.trim() || '';
        const phone = document.getElementById('profile-phone')?.value.trim() || '';
        
        if (!name) {
            this.showMessage('Name is required');
            return;
        }
        
        try {
            // Update locally for now
            this.currentUser.name = name;
            this.currentUser.email = email;
            this.currentUser.phone = phone;
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUserUI();
            this.showMessage('Profile updated successfully!');
            this.showSection('main');
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showMessage('Failed to update profile');
        }
    }

    loadAddressData() {
        if (!this.currentUser) return;
        
        const addressContainer = document.getElementById('current-address');
        const addressForm = document.getElementById('address-form');
        
        if (!addressContainer || !addressForm) return;
        
        // Check if user has saved address
        if (this.currentUser.address) {
            addressContainer.innerHTML = `
                <div class="saved-address">
                    <h4>Saved Address</h4>
                    <p>${typeof this.currentUser.address === 'string' ? this.currentUser.address : this.currentUser.address.fullAddress}</p>
                </div>
            `;
        } else {
            addressContainer.innerHTML = '<p>No address saved yet</p>';
        }
        
        // Prefill form with existing address
        if (this.currentUser.address) {
            const deliveryAddress = document.getElementById('delivery-address');
            const addressLandmark = document.getElementById('address-landmark');
            const addressCity = document.getElementById('address-city');
            
            if (typeof this.currentUser.address === 'string') {
                if (deliveryAddress) deliveryAddress.value = this.currentUser.address;
            } else {
                if (deliveryAddress) deliveryAddress.value = this.currentUser.address.street || '';
                if (addressLandmark) addressLandmark.value = this.currentUser.address.landmark || '';
                if (addressCity) addressCity.value = this.currentUser.address.city || '';
            }
        }
        
        // Setup address form submission
        addressForm.onsubmit = (e) => {
            e.preventDefault();
            this.saveAddress();
        };
    }

    async saveAddress() {
        if (!this.currentUser) return;
        
        const street = document.getElementById('delivery-address')?.value.trim() || '';
        const landmark = document.getElementById('address-landmark')?.value.trim() || '';
        const city = document.getElementById('address-city')?.value.trim() || '';
        
        if (!street || !city) {
            this.showMessage('Delivery address and city are required');
            return;
        }
        
        const address = {
            street: street,
            landmark: landmark,
            city: city,
            fullAddress: `${street}${landmark ? ` (Near ${landmark})` : ''}, ${city}`
        };
        
        try {
            // Try to save to backend first
            const response = await fetch(`http://localhost:5000/api/user/address/${this.currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: address })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.currentUser.address = address;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    this.showMessage('Address saved successfully!');
                    this.loadAddressData();
                    return;
                }
            }
            
            // Fallback to local storage
            throw new Error('Backend save failed');
            
        } catch (error) {
            console.error('Error saving address:', error);
            // Save locally as fallback
            this.currentUser.address = address;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showMessage('Address saved locally!');
            this.loadAddressData();
        }
    }

    // Storage Management
    saveCartToStorage() {
        localStorage.setItem('lemonadeCart', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('lemonadeCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    loadUserPreferences() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.currentTheme);
        }

        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // Navigation
    setupEventListeners() {
        // Bottom navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const view = navItem.getAttribute('data-view');
                this.switchView(view);
            }
        });

        // Category navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const categoryCard = e.target.closest('.category-card');
                const category = categoryCard.getAttribute('data-category');
                this.filterByCategory(category);
                this.switchView('home-view');
            }
        });

        // Search functionality
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
          // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            this.initiateCheckout();
        });
    }

        // Cart actions
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clear-cart-top') {
                if (this.cart.length > 0 && confirm('Are you sure you want to clear your cart?')) {
                    this.clearCart();
                }
            }
            
            if (e.target.id === 'checkout-btn') {
                this.initiateCheckout();
            }
        });

        // Setup authentication event listeners
        this.setupAuthEventListeners();
    }

    setupAuthEventListeners() {
        // Auth tabs
        document.addEventListener('click', (e) => {
            if (e.target.closest('.auth-tab')) {
                const tab = e.target.closest('.auth-tab').getAttribute('data-tab');
                this.switchAuthTab(tab);
            }
        });

        // Auth forms
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // Simplified Authentication
    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    // Updated authentication functions
    async handleLogin() {
        const identifier = document.getElementById('login-identifier').value.trim();
        
        if (!identifier) {
            this.showMessage('Please enter your email or phone number');
            return;
        }

        try {
            // Call backend login API
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: identifier.includes('@') ? identifier : null,
                    phone: !identifier.includes('@') ? identifier : null,
                    password: 'default-password'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.updateUserUI();
                this.showMessage(`Welcome back, ${data.user.name}! 👋`);
            } else {
                this.showMessage('Login failed. Please try signing up first.');
                this.switchAuthTab('signup');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Network error. Please try again.');
        }
    }

    async handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();

        if (!name) {
            this.showMessage('Please enter your name');
            return;
        }

        if (!email && !phone) {
            this.showMessage('Please enter either email or phone number');
            return;
        }

        try {
            // Call backend signup API
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email || null,
                    phone: phone || null,
                    password: 'default-password'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.updateUserUI();
                this.showMessage(`Welcome to Lily's Lemonade, ${name}! 🎉`);
            } else {
                this.showMessage('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage('Network error. Please try again.');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserUI();
        this.showMessage('Logged out successfully 👋');
    }

    updateUserUI() {
        const authSection = document.getElementById('auth-section');
        const userMenu = document.getElementById('user-menu');
        const userGreeting = document.getElementById('user-greeting');
        const userStatus = document.getElementById('user-status');

        if (this.currentUser) {
            if (authSection) authSection.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userGreeting) userGreeting.textContent = `Hello, ${this.currentUser.name}!`;
            
            if (this.currentUser.email && this.currentUser.phone) {
                if (userStatus) userStatus.textContent = `${this.currentUser.email} • ${this.currentUser.phone}`;
            } else if (this.currentUser.email) {
                if (userStatus) userStatus.textContent = this.currentUser.email;
            } else {
                if (userStatus) userStatus.textContent = this.currentUser.phone;
            }
        } else {
            if (authSection) authSection.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            if (userGreeting) userGreeting.textContent = 'Hello, Guest!';
            if (userStatus) userStatus.textContent = 'Sign in to your account';
        }
    }

    // Other methods remain the same...
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

        const targetView = document.getElementById(viewName);
        const targetNav = document.querySelector(`[data-view="${viewName}"]`);
        
        if (targetView) targetView.classList.add('active');
        if (targetNav) targetNav.classList.add('active');

        if (viewName === 'cart-view') {
            this.updateCartView();
        }
    }

    filterByCategory(category) {
        document.querySelectorAll('.category-card').forEach(card => card.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        const categoryNames = {
            'all': 'All Products',
            'classic': 'Classic Drinks', 
            'special': 'Specialty Drinks',
            'treat': 'Sweet Treats'
        };

        const categoryDescriptions = {
            'all': 'Discover our refreshing lemonade collection!',
            'classic': 'Traditional lemonade favorites everyone loves!',
            'special': 'Unique and creative lemonade creations!',
            'treat': 'Delicious lemon-flavored snacks and desserts!'
        };

        const currentCategory = document.getElementById('current-category');
        const categoryDescription = document.getElementById('category-description');
        
        if (currentCategory) currentCategory.textContent = categoryNames[category];
        if (categoryDescription) categoryDescription.textContent = categoryDescriptions[category];
        this.filterProducts('', category);
    }

    filterProducts(searchTerm = '', category = 'all') {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productName = product.getAttribute('data-name');
            const productTags = product.getAttribute('data-tags');
            const productCategory = product.getAttribute('data-category');
            const productText = (productName + ' ' + productTags).toLowerCase();
            
            const matchesSearch = !searchTerm || productText.includes(searchTerm.toLowerCase());
            const matchesCategory = category === 'all' || productCategory === category;
            
            product.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
        });
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Utility Functions
    showMessage(message) {
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) existingMessage.remove();

        const messageElement = document.createElement('div');
        messageElement.className = 'message-toast';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: var(--shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 3000);
    }

    updateUI() {
        this.updateCartDisplay();
        this.updateUserUI();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.lemonadeApp = new LemonadeApp();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .add-to-cart.out-of-stock {
        background: var(--text-light) !important;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);
