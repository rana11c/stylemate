// Styler - Shopping Features JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize favorite buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            toggleFavorite(this, productId);
        });
    });
    
    // Initialize search functionality
    const searchForm = document.getElementById('shopping-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.getElementById('shopping-search').value;
            performSearch(query);
        });
    }
    
    // Initialize shopping tabs
    const shoppingTabs = document.querySelectorAll('.shopping-tab');
    if (shoppingTabs.length > 0) {
        shoppingTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                shoppingTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding products
                const tabType = this.getAttribute('data-tab');
                filterProducts(tabType);
            });
        });
    }
});

// Toggle favorite status for a product
function toggleFavorite(button, productId) {
    if (!isLoggedIn()) {
        showFlashMessage('يرجى تسجيل الدخول لإضافة المنتجات إلى المفضلة', 'error');
        return;
    }
    
    // Check if already favorited
    const isFavorite = button.classList.contains('active');
    
    // Show loading state
    const originalInnerHTML = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner-small"></span>';
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
        button.innerHTML = originalInnerHTML;
        button.disabled = false;
        
        if (data.status === 'added') {
            button.classList.add('active');
            showFlashMessage('تمت إضافة المنتج إلى المفضلة');
        } else if (data.status === 'removed') {
            button.classList.remove('active');
            showFlashMessage('تم إزالة المنتج من المفضلة');
        }
    })
    .catch(error => {
        // Restore button state
        button.innerHTML = originalInnerHTML;
        button.disabled = false;
        
        console.error('Error toggling favorite:', error);
        showFlashMessage('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    });
}

// Filter products based on tab
function filterProducts(tabType) {
    const allProducts = document.querySelectorAll('.product-card');
    
    if (tabType === 'all') {
        // Show all products
        allProducts.forEach(product => {
            product.style.display = '';
        });
    } else if (tabType === 'favorites') {
        // Show only favorited products
        allProducts.forEach(product => {
            const isFavorite = product.querySelector('.favorite-btn.active') !== null;
            product.style.display = isFavorite ? '' : 'none';
        });
    } else if (tabType === 'recommendations') {
        // Show only recommended products
        allProducts.forEach(product => {
            const isRecommended = product.classList.contains('recommended');
            product.style.display = isRecommended ? '' : 'none';
        });
    }
}

// Load more products (pagination)
function loadMoreProducts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (!loadMoreBtn) return;
    
    // Show loading state
    loadMoreBtn.innerHTML = '<span class="loading-spinner-small"></span> جاري التحميل...';
    loadMoreBtn.disabled = true;
    
    // Get current page
    const currentPage = parseInt(loadMoreBtn.getAttribute('data-page') || '1');
    const nextPage = currentPage + 1;
    
    // In a real app, this would call a backend API to fetch more products
    // For demo, we'll just simulate a delay
    setTimeout(() => {
        // Update button
        loadMoreBtn.innerHTML = 'عرض المزيد';
        loadMoreBtn.disabled = false;
        loadMoreBtn.setAttribute('data-page', nextPage.toString());
        
        // Hide the button after page 3 to simulate end of products
        if (nextPage >= 3) {
            loadMoreBtn.style.display = 'none';
        }
        
        // Add new products (in a real app, this would add actual new products)
        showFlashMessage('تم تحميل المزيد من المنتجات');
    }, 1500);
}

// Check if user is logged in
function isLoggedIn() {
    return document.body.classList.contains('logged-in');
}
