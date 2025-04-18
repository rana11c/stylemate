// Styler - Main JavaScript File

// DOM elements and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize flash messages
    initFlashMessages();
    
    // Initialize bottom navigation
    initBottomNavigation();
    
    // Initialize tab menus
    initTabMenus();
    
    // Initialize current date
    updateCurrentDate();
    
    // Initialize demo data (for demonstration purposes)
    initializeDemoData();
});

// Navigation functions
function initBottomNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Handle navigation based on target
            if (target) {
                window.location.href = `/${target}`;
            }
        });
    });
    
    // Highlight active nav item based on current page
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        const target = item.getAttribute('data-target') || '';
        if ((currentPath === '/' && target === '') || 
            (currentPath !== '/' && currentPath.includes(target))) {
            item.classList.add('active');
        }
    });
}

// Tab menu functions
function initTabMenus() {
    const tabMenus = document.querySelectorAll('.tab-menu');
    
    tabMenus.forEach(menu => {
        const tabs = menu.querySelectorAll('.tab-item');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Handle tab content display
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    const tabContents = document.querySelectorAll('.tab-content');
                    tabContents.forEach(content => {
                        content.style.display = 'none';
                    });
                    
                    const targetContent = document.getElementById(targetId);
                    if (targetContent) {
                        targetContent.style.display = 'block';
                    }
                }
            });
        });
    });
}

// Flash messages
function initFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        // Auto-dismiss flash messages after 5 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

// Create and show a flash message
function showFlashMessage(message, type = 'success') {
    const flashContainer = document.querySelector('.flash-container') || createFlashContainer();
    
    const messageElement = document.createElement('div');
    messageElement.className = `flash-message flash-${type}`;
    messageElement.textContent = message;
    
    flashContainer.appendChild(messageElement);
    
    // Auto-dismiss
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-container';
    document.body.appendChild(container);
    return container;
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Initialize modals with close buttons
function initModals() {
    const closeButtons = document.querySelectorAll('.modal-close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.closest('.modal-overlay').id;
            closeModal(modalId);
        });
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Update current date in Arabic format
function updateCurrentDate() {
    const dateElement = document.querySelector('.current-date');
    if (!dateElement) return;
    
    // This would normally be done server-side with proper localization
    // For demo purposes, we're using hardcoded Arabic date from the mockup
    dateElement.textContent = 'الاثنين، ١٢ شوال';
}

// Initialize demo data for the app
function initializeDemoData() {
    // Call the backend endpoint to initialize demo data
    fetch('/initialize_demo_data')
        .then(response => response.json())
        .then(data => {
            console.log('Demo data status:', data.status);
            
            // Load initial data for the current page
            const currentPath = window.location.pathname;
            
            if (currentPath === '/' || currentPath === '/index') {
                loadWeatherData();
            } else if (currentPath === '/shopping') {
                loadShoppingProducts();
            }
        })
        .catch(error => {
            console.error('Error initializing demo data:', error);
        });
}

// Load weather data - would be replaced with actual API calls
function loadWeatherData() {
    // For demo purposes, we're using static data that matches the mockup
    // In a real app, this would call the backend API
    displayWeatherData();
}

// Display weather data on the page
function displayWeatherData() {
    // This function would update the UI with weather data
    // For now, it's preset in the HTML to match the mockup
}

// Toggle favorite item
function toggleFavorite(element, productId) {
    if (!isLoggedIn()) {
        showFlashMessage('يرجى تسجيل الدخول لإضافة المنتجات إلى المفضلة', 'error');
        return;
    }
    
    const isFavorite = element.classList.contains('favorite');
    
    // Send request to server
    fetch('/shopping/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product_id=${productId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'added') {
            element.classList.add('favorite');
            showFlashMessage('تمت إضافة المنتج إلى المفضلة');
        } else if (data.status === 'removed') {
            element.classList.remove('favorite');
            showFlashMessage('تم إزالة المنتج من المفضلة');
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
        showFlashMessage('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    });
}

// Check if user is logged in
function isLoggedIn() {
    return document.body.classList.contains('logged-in');
}

// Handle outfit of the day reload
function reloadOutfit() {
    const outfitSection = document.querySelector('.outfit-section');
    if (!outfitSection) return;
    
    const loadingHtml = `
        <div class="loading">
            <div class="loading-spinner"></div>
        </div>
    `;
    
    outfitSection.innerHTML = loadingHtml;
    
    // In a real app, this would fetch new recommendations from the server
    setTimeout(() => {
        // For demo, just show the error message again
        outfitSection.innerHTML = `
            <div class="outfit-error">
                <div>حدث خطأ أثناء تحميل الإطلالة</div>
                <button class="outfit-reload" onclick="reloadOutfit()">إعادة المحاولة</button>
            </div>
        `;
    }, 1500);
}

// Search functionality
function performSearch(query) {
    if (!query || query.trim() === '') return;
    
    // Show loading indicator
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
    }
    
    // In a real app, this would search products from the server
    // For demo, we'll just simulate a delay
    setTimeout(() => {
        // Redirect to shopping page with search query
        window.location.href = `/shopping?q=${encodeURIComponent(query)}`;
    }, 500);
}
