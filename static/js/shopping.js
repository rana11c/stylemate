// Styler - Shopping Features JavaScript

// Shopping Cart Data
let cart = JSON.parse(localStorage.getItem('styler_cart') || '[]');
let currentProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab menu
    initTabMenu();
    
    // Initialize cart
    updateCartSummary();
    
    // Initialize favorite buttons (page load)
    initFavoriteButtons();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize size option buttons
    initSizeButtons();
    
    // Initialize payment method tabs
    initPaymentTabs();
    
    // Show cart summary if items exist
    if (cart.length > 0) {
        document.getElementById('cart-summary').classList.add('active');
    }
    
    // Initialize shopping tabs
    const tabItems = document.querySelectorAll('.tab-item');
    if (tabItems.length > 0) {
        tabItems.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all tabs
                tabItems.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding products
                const tabType = this.getAttribute('data-target');
                filterProducts(tabType);
            });
        });
    }
});

// Initialize tab menu
function initTabMenu() {
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabItems.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter products based on selected tab
            const tabType = this.getAttribute('data-target');
            filterProducts(tabType);
        });
    });
}

// Initialize search functionality
function initSearch() {
    const searchForm = document.getElementById('shopping-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.getElementById('shopping-search').value.trim().toLowerCase();
            
            if (query.length === 0) {
                // Show all products if search is empty
                filterProducts('recommended');
                return;
            }
            
            // Search for products
            const products = document.querySelectorAll('.product-card');
            let foundAny = false;
            
            products.forEach(product => {
                const name = product.querySelector('.product-name').textContent.toLowerCase();
                const category = product.getAttribute('data-category').toLowerCase();
                
                if (name.includes(query) || category.includes(query)) {
                    product.style.display = '';
                    foundAny = true;
                } else {
                    product.style.display = 'none';
                }
            });
            
            // Show message if no products found
            if (!foundAny) {
                showFlashMessage('لم يتم العثور على منتجات تطابق البحث', 'error');
            }
        });
    }
}

// Initialize favorite buttons
function initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        const productId = button.getAttribute('data-product-id');
        
        // Update icon based on active state
        if (button.classList.contains('active')) {
            button.querySelector('i').className = 'fas fa-heart';
        } else {
            button.querySelector('i').className = 'far fa-heart';
        }
    });
}

// Initialize size option buttons
function initSizeButtons() {
    const sizeButtons = document.querySelectorAll('.size-options .option-btn');
    sizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all size buttons
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
        });
    });
}

// Toggle favorite status for a product
function toggleFavorite(button, productId) {
    if (!isLoggedIn()) {
        showFlashMessage('يرجى تسجيل الدخول لإضافة المنتجات إلى المفضلة', 'error');
        return;
    }
    
    // Check if already favorited
    const isFavorite = button.classList.contains('active');
    
    // Show loading state
    const originalIcon = button.querySelector('i');
    const originalIconClass = originalIcon.className;
    originalIcon.className = 'fas fa-spinner fa-spin';
    button.disabled = true;
    
    // In a real app, this would call a backend API
    fetch('/shopping/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product_id=${productId}`
    })
    .then(response => response.json())
    .then(data => {
        // Restore button state
        button.disabled = false;
        
        if (data.status === 'added') {
            button.classList.add('active');
            originalIcon.className = 'fas fa-heart';
            showFlashMessage('تمت إضافة المنتج إلى المفضلة');
        } else if (data.status === 'removed') {
            button.classList.remove('active');
            originalIcon.className = 'far fa-heart';
            showFlashMessage('تم إزالة المنتج من المفضلة');
        }
    })
    .catch(error => {
        // Restore button state
        originalIcon.className = originalIconClass;
        button.disabled = false;
        
        console.error('Error toggling favorite:', error);
        showFlashMessage('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    });
}

// Toggle favorite from modal
function toggleFavoriteFromModal() {
    if (!currentProduct) return;
    
    const button = document.getElementById('modal-favorite-btn');
    const icon = button.querySelector('i');
    const isActive = icon.classList.contains('fas');
    
    if (isActive) {
        icon.className = 'far fa-heart';
        button.innerHTML = '<i class="far fa-heart"></i> أضف إلى المفضلة';
    } else {
        icon.className = 'fas fa-heart';
        button.innerHTML = '<i class="fas fa-heart"></i> إزالة من المفضلة';
    }
    
    // Update the favorite button on the product card
    const productCard = document.querySelector(`.product-card[data-id="${currentProduct.id}"]`);
    if (productCard) {
        const cardButton = productCard.querySelector('.favorite-btn');
        toggleFavorite(cardButton, currentProduct.id);
    } else {
        // If the product card isn't found, call the toggle directly
        toggleFavorite(button, currentProduct.id);
    }
}

// Filter products based on category or tab
function filterProducts(tabType) {
    const allProducts = document.querySelectorAll('.product-card');
    
    if (tabType === 'recommended') {
        // Show all products (for simplicity)
        allProducts.forEach(product => {
            product.style.display = '';
        });
    } else if (tabType === 'popular') {
        // In a real app, this would filter by popularity
        // For demo, just shuffle products visibility
        allProducts.forEach((product, index) => {
            product.style.display = index % 2 === 0 ? '' : 'none';
        });
    } else if (tabType === 'favorites') {
        // Show only favorited products
        allProducts.forEach(product => {
            const favoriteBtn = product.querySelector('.favorite-btn');
            if (favoriteBtn && favoriteBtn.classList.contains('active')) {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
    } else {
        // Filter by category
        allProducts.forEach(product => {
            const category = product.getAttribute('data-category');
            if (category === tabType || tabType === 'all') {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
    }
}

// Load more products (pagination)
function loadMoreProducts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (!loadMoreBtn) return;
    
    // Show loading state
    const originalText = loadMoreBtn.textContent;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
    loadMoreBtn.disabled = true;
    
    // Get current page
    const currentPage = parseInt(loadMoreBtn.getAttribute('data-page') || '1');
    const nextPage = currentPage + 1;
    
    // In a real app, this would call a backend API to fetch more products
    // For demo, we'll just simulate a delay
    setTimeout(() => {
        // Update button
        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;
        loadMoreBtn.setAttribute('data-page', nextPage.toString());
        
        // Hide the button after page 3 to simulate end of products
        if (nextPage >= 3) {
            loadMoreBtn.style.display = 'none';
        }
        
        // Add new products (in a real app, this would add actual new products)
        showFlashMessage('تم تحميل المزيد من المنتجات');
    }, 1000);
}

// Check if user is logged in
function isLoggedIn() {
    // This should check for logged in state
    // For demo, we'll assume the user is logged in if there's a profile link
    return document.querySelector('.nav-item[href="/profile"]') !== null;
}

// Open product modal with details
function openProductModal(productId) {
    // Find product in DOM
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    
    // If product card not found or no ID supplied, use the first product
    const actualProductCard = productCard || document.querySelector('.product-card');
    
    if (!actualProductCard) return;
    
    // Extract product information
    const name = actualProductCard.querySelector('.product-name').textContent;
    const price = actualProductCard.querySelector('.product-price').textContent;
    const image = actualProductCard.querySelector('.product-image').src;
    const favoriteBtn = actualProductCard.querySelector('.favorite-btn');
    const isFavorite = favoriteBtn && favoriteBtn.classList.contains('active');
    
    // Set current product
    currentProduct = {
        id: productId || 1,
        name: name,
        price: price,
        image: image,
        favorite: isFavorite
    };
    
    // Update modal
    document.getElementById('modal-product-name').textContent = name;
    document.getElementById('modal-product-price').textContent = price;
    document.getElementById('modal-product-image').src = image;
    document.getElementById('modal-product-description').textContent = 'وصف المنتج يظهر هنا. في التطبيق الحقيقي سيتم عرض الوصف الكامل والتفاصيل الإضافية للمنتج.';
    
    // Update favorite button
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    if (isFavorite) {
        modalFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> إزالة من المفضلة';
    } else {
        modalFavoriteBtn.innerHTML = '<i class="far fa-heart"></i> أضف إلى المفضلة';
    }
    
    // Reset quantity
    document.getElementById('product-quantity').value = 1;
    
    // Reset size selection
    const sizeButtons = document.querySelectorAll('.size-options .option-btn');
    sizeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Select the first size by default
    if (sizeButtons.length > 0) {
        sizeButtons[0].classList.add('active');
    }
    
    // Open modal
    openModal('product-modal');
}

// Add product to cart
function addToCart(productId) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    
    if (!productCard) {
        console.error('Product not found');
        return;
    }
    
    const name = productCard.querySelector('.product-name').textContent;
    const price = productCard.querySelector('.product-price').textContent.replace(' ريال', '');
    const image = productCard.querySelector('.product-image').src;
    
    addProductToCart({
        id: productId,
        name: name,
        price: parseFloat(price),
        image: image,
        quantity: 1,
        size: 'M'  // Default size
    });
}

// Add to cart from product modal
function addToCartFromModal() {
    if (!currentProduct) return;
    
    // Get selected size
    const sizeBtn = document.querySelector('.size-options .option-btn.active');
    const size = sizeBtn ? sizeBtn.textContent : 'M';
    
    // Get quantity
    const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
    
    // Extract price as number
    const priceText = currentProduct.price;
    const price = parseFloat(priceText.replace(' ريال', ''));
    
    // Add to cart
    addProductToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: price,
        image: currentProduct.image,
        quantity: quantity,
        size: size
    });
    
    // Close modal
    closeModal('product-modal');
}

// Add product to cart (shared function)
function addProductToCart(product) {
    // Check if product already in cart
    const existingProductIndex = cart.findIndex(item => 
        item.id === product.id && item.size === product.size);
    
    if (existingProductIndex !== -1) {
        // Update quantity if already in cart
        cart[existingProductIndex].quantity += product.quantity;
    } else {
        // Add new product to cart
        cart.push(product);
    }
    
    // Save cart to localStorage
    localStorage.setItem('styler_cart', JSON.stringify(cart));
    
    // Update cart UI
    updateCartSummary();
    
    // Show success message
    showFlashMessage('تمت إضافة المنتج إلى السلة');
}

// Update cart summary UI
function updateCartSummary() {
    const cartCount = document.querySelector('.cart-count');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartCount || !cartSummary) return;
    
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide cart summary
    if (totalItems > 0) {
        cartSummary.classList.add('active');
    } else {
        cartSummary.classList.remove('active');
    }
}

// Open cart modal
function openCartModal() {
    // Generate cart items HTML
    const cartItemsContainer = document.getElementById('cart-items-container');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-state">السلة فارغة</div>';
        document.getElementById('cart-total-price').textContent = '0 ريال';
    } else {
        let totalPrice = 0;
        let cartHTML = '';
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            cartHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} ريال</div>
                        <div class="cart-item-quantity">المقاس: ${item.size} | الكمية: ${item.quantity}</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = cartHTML;
        document.getElementById('cart-total-price').textContent = totalPrice.toFixed(2) + ' ريال';
    }
    
    openModal('cart-modal');
}

// Remove item from cart
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    // Remove item
    cart.splice(index, 1);
    
    // Save cart to localStorage
    localStorage.setItem('styler_cart', JSON.stringify(cart));
    
    // Update cart UI
    updateCartSummary();
    
    // Update cart modal
    openCartModal();
    
    // Show success message
    showFlashMessage('تم إزالة المنتج من السلة');
}

// Clear cart
function clearCart() {
    // Clear cart array
    cart = [];
    
    // Save empty cart to localStorage
    localStorage.setItem('styler_cart', JSON.stringify(cart));
    
    // Update cart UI
    updateCartSummary();
    
    // Update cart modal
    openCartModal();
    
    // Show success message
    showFlashMessage('تم إفراغ السلة');
}

// Proceed to checkout
function proceedToCheckout() {
    // Update order total in checkout modal
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    document.getElementById('order-total-price').textContent = totalPrice.toFixed(2) + ' ريال';
    
    // Close cart modal
    closeModal('cart-modal');
    
    // Open checkout modal
    openModal('checkout-modal');
    
    // Set up checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.onsubmit = function(e) {
            e.preventDefault();
            completeOrder();
        };
    }
}

// Complete order
function completeOrder() {
    // Validate payment fields if credit card is selected
    const paymentTabs = document.querySelectorAll('.payment-method-tab');
    const activeTab = Array.from(paymentTabs).find(tab => tab.classList.contains('active'));
    
    if (activeTab && activeTab.getAttribute('data-target') === 'card-payment') {
        // Validate card details
        const cardNumber = document.getElementById('card-number');
        const cardName = document.getElementById('card-name');
        const cardExpiry = document.getElementById('card-expiry');
        const cardCvc = document.getElementById('card-cvc');
        
        if (!cardNumber || !cardNumber.value || cardNumber.value.replace(/\s/g, '').length < 16) {
            showFlashMessage('يرجى إدخال رقم بطاقة صحيح', 'error');
            return;
        }
        
        if (!cardName || !cardName.value) {
            showFlashMessage('يرجى إدخال اسم حامل البطاقة', 'error');
            return;
        }
        
        if (!cardExpiry || !cardExpiry.value || !cardExpiry.value.includes('/')) {
            showFlashMessage('يرجى إدخال تاريخ انتهاء البطاقة بالصيغة الصحيحة (MM/YY)', 'error');
            return;
        }
        
        if (!cardCvc || !cardCvc.value || cardCvc.value.length < 3) {
            showFlashMessage('يرجى إدخال رمز الأمان (CVC)', 'error');
            return;
        }
    }
    
    // Get form data
    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    
    // Validate form (simple validation)
    if (!name) {
        showFlashMessage('يرجى إدخال الاسم الكامل', 'error');
        return;
    }
    
    if (!phone || phone.length < 10) {
        showFlashMessage('يرجى إدخال رقم هاتف صحيح', 'error');
        return;
    }
    
    if (!address) {
        showFlashMessage('يرجى إدخال عنوان التوصيل', 'error');
        return;
    }
    
    // Show processing message
    showFlashMessage('جاري معالجة الطلب...', 'info');
    
    // In a real app, this would submit the order data to the server
    // Simulate processing delay
    setTimeout(() => {
        // Generate random order number
        const orderNumber = Math.floor(10000 + Math.random() * 90000);
        document.getElementById('order-number').textContent = orderNumber;
        
        // Clear cart
        cart = [];
        localStorage.setItem('styler_cart', JSON.stringify(cart));
        updateCartSummary();
        
        // Close checkout modal
        closeModal('checkout-modal');
        
        // Open confirmation modal
        openModal('order-confirmation-modal');
    }, 1500);
}

// Quantity controls
function increaseQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    let quantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = quantity + 1;
}

function decreaseQuantity() {
    const quantityInput = document.getElementById('product-quantity');
    let quantity = parseInt(quantityInput.value) || 1;
    if (quantity > 1) {
        quantityInput.value = quantity - 1;
    }
}

// Initialize payment method tabs
function initPaymentTabs() {
    const paymentTabs = document.querySelectorAll('.payment-method-tab');
    
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            paymentTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content sections
            const contentSections = document.querySelectorAll('.payment-method-content');
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show selected content
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            }
        });
    });
    
    // Format credit card number with spaces
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '');
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
            }
            e.target.value = value;
        });
    }
    
    // Format expiry date with slash
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\//g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });
    }
}

// Open/close modals
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}
