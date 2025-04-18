// Styler - Suggestions JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab menu for suggestions
    initSuggestionsTabMenu();
});

// Initialize tab menu
function initSuggestionsTabMenu() {
    const tabItems = document.querySelectorAll('.tab-menu .tab-item');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabItems.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get target section ID
            const targetId = this.getAttribute('data-target') + '-section';
            
            // Hide all sections
            document.querySelectorAll('.suggestions-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show target section
            document.getElementById(targetId).style.display = 'block';
        });
    });
}

// Save outfit to collection
function saveOutfit(outfitId) {
    if (!isLoggedIn()) {
        showFlashMessage('يرجى تسجيل الدخول لحفظ الإطلالات', 'error');
        return;
    }
    
    showFlashMessage('تم حفظ الإطلالة بنجاح!', 'success');
}

// Show similar outfits
function showSimilar(outfitId) {
    // Outfit data mapping
    const outfitData = {
        1: {
            title: "إطلالة كاجوال للجامعة",
            image: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=600",
            pieces: [
                "تيشيرت أبيض بسيط",
                "جينز أزرق فاتح",
                "حذاء رياضي أبيض",
                "ساعة يد كاجوال"
            ]
        },
        2: {
            title: "إطلالة رسمية للعمل",
            image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=600",
            pieces: [
                "قميص أزرق فاتح",
                "بنطال كلاسيكي أسود",
                "حزام جلد أسود",
                "حذاء كلاسيكي أسود"
            ]
        },
        3: {
            title: "إطلالة رياضية",
            image: "https://images.pexels.com/photos/1176618/pexels-photo-1176618.jpeg?auto=compress&cs=tinysrgb&w=600",
            pieces: [
                "تيشيرت رياضي",
                "شورت رياضي",
                "حذاء رياضي",
                "جوارب رياضية"
            ]
        }
    };
    
    // Get outfit data
    const outfit = outfitData[outfitId];
    if (!outfit) return;
    
    // Update modal content
    document.getElementById('outfit-modal-title').textContent = outfit.title;
    document.getElementById('outfit-modal-image').src = outfit.image;
    
    // Update pieces list
    const piecesList = document.getElementById('outfit-pieces-list');
    piecesList.innerHTML = '';
    
    outfit.pieces.forEach(piece => {
        const listItem = document.createElement('li');
        listItem.textContent = piece;
        piecesList.appendChild(listItem);
    });
    
    // Open modal
    openModal('outfit-detail-modal');
}

// Save outfit from modal
function saveOutfitFromModal() {
    if (!isLoggedIn()) {
        showFlashMessage('يرجى تسجيل الدخول لحفظ الإطلالات', 'error');
        closeModal('outfit-detail-modal');
        return;
    }
    
    showFlashMessage('تم حفظ الإطلالة بنجاح!', 'success');
    closeModal('outfit-detail-modal');
}

// Find similar products
function findSimilarProducts() {
    closeModal('outfit-detail-modal');
    window.location.href = '/shopping';
}

// Explore style
function exploreStyle(styleId) {
    showFlashMessage('جاري تحميل نمط ' + styleId, 'info');
    // This would typically navigate to a style details page
}

// Show outfits for an occasion
function showOccasionOutfits(occasionId) {
    showFlashMessage('جاري تحميل إطلالات المناسبة: ' + occasionId, 'info');
    // This would typically show outfits for the selected occasion
}

// Check if user is logged in
function isLoggedIn() {
    // This should check for logged in state
    // For demo, we'll assume the user is logged in if there's a profile link
    return document.querySelector('.nav-item[href="/profile"]') !== null;
}

// Helper functions
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

function showFlashMessage(message, type = 'success') {
    // Call the global showFlashMessage function if it exists
    if (typeof window.showFlashMessage === 'function') {
        window.showFlashMessage(message, type);
    } else {
        // Fallback implementation
        alert(message);
    }
}