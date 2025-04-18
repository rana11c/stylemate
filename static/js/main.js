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
    
    // Initialize header popups (notifications and menu)
    initHeaderPopups();
    
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

// Initialize header popup functionality (notifications and menu)
function initHeaderPopups() {
    // Notifications popup
    const notificationsIcon = document.getElementById('notifications-icon');
    const notificationsPopup = document.getElementById('notifications-popup');
    
    if (notificationsIcon && notificationsPopup) {
        notificationsIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close menu popup if open
            const menuPopup = document.getElementById('menu-popup');
            if (menuPopup) {
                menuPopup.classList.remove('active');
            }
            
            // Toggle notifications popup
            notificationsPopup.classList.toggle('active');
        });
    }
    
    // Menu popup
    const menuIcon = document.getElementById('menu-icon');
    const menuPopup = document.getElementById('menu-popup');
    
    if (menuIcon && menuPopup) {
        menuIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close notifications popup if open
            if (notificationsPopup) {
                notificationsPopup.classList.remove('active');
            }
            
            // Toggle menu popup
            menuPopup.classList.toggle('active');
        });
    }
    
    // Close popups when clicking outside
    document.addEventListener('click', function(e) {
        if (notificationsPopup && !notificationsPopup.contains(e.target) && e.target !== notificationsIcon) {
            notificationsPopup.classList.remove('active');
        }
        
        if (menuPopup && !menuPopup.contains(e.target) && e.target !== menuIcon) {
            menuPopup.classList.remove('active');
        }
    });
    
    // Make popup items clickable
    const popupItems = document.querySelectorAll('.popup-item');
    popupItems.forEach(item => {
        if (!item.hasAttribute('onclick')) {
            item.addEventListener('click', function() {
                // Handle menu item click - default is to close popup
                const popup = this.closest('.header-popup');
                if (popup) {
                    popup.classList.remove('active');
                }
                
                // Get the action type from data attribute
                const actionType = this.getAttribute('data-action');
                
                // Handle different action types
                if (actionType === 'logout') {
                    // Redirect to logout
                    window.location.href = '/logout';
                } else if (actionType === 'settings') {
                    // Open settings modal
                    openAccountSettingsModal();
                } else if (actionType === 'notifications') {
                    // Toggle notifications settings
                    toggleNotificationSettings();
                } else if (actionType === 'support') {
                    // Open support chat
                    openSupportChat();
                } else if (actionType === 'language') {
                    // Toggle language
                    toggleLanguage();
                } else {
                    // Default behavior - show feedback
                    const itemTitle = this.querySelector('.popup-item-title');
                    if (itemTitle) {
                        showFlashMessage(`تم النقر على "${itemTitle.textContent}"`);
                    }
                }
            });
        }
    });
    
    // Add actions for specific menu items by ID
    const logoutItem = document.getElementById('logout-item');
    if (logoutItem) {
        logoutItem.setAttribute('data-action', 'logout');
    }
    
    const settingsItem = document.getElementById('settings-item');
    if (settingsItem) {
        settingsItem.setAttribute('data-action', 'settings');
    }
    
    const notificationsItem = document.getElementById('notifications-settings-item');
    if (notificationsItem) {
        notificationsItem.setAttribute('data-action', 'notifications');
    }
    
    const supportItem = document.getElementById('support-item');
    if (supportItem) {
        supportItem.setAttribute('data-action', 'support');
    }
    
    const languageItem = document.getElementById('language-item');
    if (languageItem) {
        languageItem.setAttribute('data-action', 'language');
    }
}

// Account settings modal
function openAccountSettingsModal() {
    // Check if modal exists
    let modal = document.getElementById('account-settings-modal');
    
    // Create modal if it doesn't exist
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'account-settings-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2>إعدادات الحساب</h2>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content">
                    <div class="settings-section">
                        <h3>المعلومات الشخصية</h3>
                        <form id="profile-form">
                            <div class="form-group">
                                <label for="display-name">الاسم</label>
                                <input type="text" id="display-name" value="مستخدم ستايلر" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="user-email">البريد الإلكتروني</label>
                                <input type="email" id="user-email" value="user@example.com" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="user-phone">رقم الهاتف</label>
                                <input type="tel" id="user-phone" value="+966 5xxxxxxxx" class="form-control">
                            </div>
                        </form>
                    </div>
                    <div class="settings-section">
                        <h3>تغيير كلمة المرور</h3>
                        <form id="password-form">
                            <div class="form-group">
                                <label for="current-password">كلمة المرور الحالية</label>
                                <input type="password" id="current-password" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="new-password">كلمة المرور الجديدة</label>
                                <input type="password" id="new-password" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="confirm-password">تأكيد كلمة المرور</label>
                                <input type="password" id="confirm-password" class="form-control">
                            </div>
                        </form>
                    </div>
                    <div class="settings-section">
                        <h3>إعدادات الإشعارات</h3>
                        <div class="settings-option">
                            <label for="email-notifications">إشعارات البريد الإلكتروني</label>
                            <label class="switch">
                                <input type="checkbox" id="email-notifications" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        <div class="settings-option">
                            <label for="push-notifications">إشعارات الموقع</label>
                            <label class="switch">
                                <input type="checkbox" id="push-notifications" checked>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('account-settings-modal')">إلغاء</button>
                    <button class="btn btn-primary" onclick="saveAccountSettings()">حفظ التغييرات</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                closeModal('account-settings-modal');
            });
        }
    }
    
    // Open the modal
    openModal('account-settings-modal');
}

// Save account settings
function saveAccountSettings() {
    // Get form values
    const displayName = document.getElementById('display-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    
    // Validate current password if changing password
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword || confirmPassword) {
        if (!currentPassword) {
            showFlashMessage('يرجى إدخال كلمة المرور الحالية', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showFlashMessage('كلمة المرور الجديدة غير متطابقة', 'error');
            return;
        }
    }
    
    // In a real app, this would send data to the server
    // For demo, we'll just show success message
    showFlashMessage('تم حفظ التغييرات بنجاح');
    closeModal('account-settings-modal');
}

// Toggle notification settings
function toggleNotificationSettings() {
    openAccountSettingsModal();
    
    // Scroll to notifications section
    setTimeout(() => {
        const notificationsSection = document.querySelector('.settings-section:nth-child(3)');
        if (notificationsSection) {
            notificationsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Open support chat
function openSupportChat() {
    // Check if chat modal exists
    let modal = document.getElementById('support-chat-modal');
    
    if (!modal) {
        // Create chat modal
        modal = document.createElement('div');
        modal.id = 'support-chat-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container chat-container">
                <div class="modal-header">
                    <h2>الدعم الفني</h2>
                    <button class="modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-content chat-content">
                    <div class="chat-messages">
                        <div class="chat-message agent">
                            <div class="message-content">
                                <p>مرحباً بك في الدعم الفني! كيف يمكنني مساعدتك اليوم؟</p>
                            </div>
                            <div class="message-time">10:30</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer chat-input">
                    <input type="text" placeholder="اكتب رسالتك هنا..." id="chat-input">
                    <button class="btn btn-primary" onclick="sendChatMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener to close button
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                closeModal('support-chat-modal');
            });
        }
        
        // Add event listener for Enter key
        const chatInput = modal.querySelector('#chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
    }
    
    // Open the modal
    openModal('support-chat-modal');
}

// Send chat message
function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput || !chatInput.value.trim()) return;
    
    const messageText = chatInput.value.trim();
    const messagesContainer = document.querySelector('.chat-messages');
    
    // Create user message
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user';
    
    // Get current time
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${messageText}</p>
        </div>
        <div class="message-time">${timeString}</div>
    `;
    
    // Add to messages container
    messagesContainer.appendChild(messageElement);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // In a real app, this would send the message to the server
    // For demo, simulate response after delay
    setTimeout(() => {
        // Create agent message
        const responseElement = document.createElement('div');
        responseElement.className = 'chat-message agent';
        
        responseElement.innerHTML = `
            <div class="message-content">
                <p>شكراً لتواصلك معنا. سيتم الرد على استفسارك في أقرب وقت ممكن.</p>
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        // Add to messages container
        messagesContainer.appendChild(responseElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

// Toggle language
function toggleLanguage() {
    // In a real app, this would toggle between available languages
    showFlashMessage('سيتم دعم اللغة الإنجليزية قريباً');
}
