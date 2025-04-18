// Styler - Outfit Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize temperature range slider
    const tempSlider = document.getElementById('outfit-temp');
    const tempValue = document.getElementById('temp-value');
    
    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }
    
    // Load daily outfit recommendation on homepage
    if (document.getElementById('outfit-container')) {
        loadDailyOutfit();
    }
});

// Open outfit upload modal
function openUploadOutfitModal() {
    openModal('upload-outfit-modal');
}

// Load daily outfit recommendation
function loadDailyOutfit() {
    const outfitContainer = document.getElementById('outfit-container');
    
    if (!outfitContainer) return;
    
    // Show loading state
    outfitContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
        </div>
    `;
    
    // Fetch daily outfit recommendation
    fetch('/outfit/daily')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' || data.status === 'ai_generated') {
                const outfit = data.outfit;
                
                // Generate outfit HTML
                let outfitHTML = `
                    <div class="outfit-display">
                        <div class="outfit-header">
                            <div class="outfit-name">${outfit.name || 'إطلالة مقترحة'}</div>
                            <div class="outfit-weather">
                                <i class="fas ${getWeatherIcon(outfit.weather_condition)}"></i>
                                ${outfit.weather_temp ? outfit.weather_temp + '°' : ''}
                            </div>
                        </div>
                        
                        <div class="outfit-items-grid">
                `;
                
                // Add outfit items
                if (outfit.items && outfit.items.length > 0) {
                    outfit.items.forEach(item => {
                        outfitHTML += `
                            <div class="outfit-item">
                                <img src="${item.image_url}" alt="${item.name}">
                                <div class="outfit-item-category">${translateCategory(item.category)}</div>
                            </div>
                        `;
                    });
                } else {
                    outfitHTML += `
                        <div class="empty-state">
                            <p>لم يتم العثور على قطع ملابس مناسبة</p>
                        </div>
                    `;
                }
                
                outfitHTML += `
                        </div>
                `;
                
                // Add notes if available
                if (outfit.notes) {
                    outfitHTML += `
                        <div class="outfit-notes">
                            <p>${outfit.notes}</p>
                        </div>
                    `;
                }
                
                // Add AI generated flag if needed
                if (data.status === 'ai_generated') {
                    outfitHTML += `
                        <div class="ai-generated-badge">
                            <i class="fas fa-robot"></i> تم إنشاؤها بواسطة الذكاء الاصطناعي
                        </div>
                    `;
                }
                
                outfitHTML += `</div>`;
                
                // Update container
                outfitContainer.innerHTML = outfitHTML;
            } else {
                // Show error state
                outfitContainer.innerHTML = `
                    <div class="outfit-error">
                        <div>حدث خطأ أثناء تحميل الإطلالة</div>
                        <button class="outfit-reload" onclick="reloadOutfit()">إعادة المحاولة</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading daily outfit:', error);
            
            // Show error state
            outfitContainer.innerHTML = `
                <div class="outfit-error">
                    <div>حدث خطأ أثناء تحميل الإطلالة</div>
                    <button class="outfit-reload" onclick="reloadOutfit()">إعادة المحاولة</button>
                </div>
            `;
        });
}

// Reload outfit recommendation
function reloadOutfit() {
    loadDailyOutfit();
}

// Get weather icon class based on condition
function getWeatherIcon(condition) {
    switch (condition) {
        case 'sunny':
            return 'fa-sun';
        case 'cloudy':
            return 'fa-cloud';
        case 'rainy':
            return 'fa-cloud-rain';
        case 'windy':
            return 'fa-wind';
        case 'cold':
            return 'fa-snowflake';
        case 'hot':
            return 'fa-temperature-high';
        default:
            return 'fa-cloud';
    }
}

// Translate category to Arabic
function translateCategory(category) {
    const translations = {
        'tops': 'ملابس علوية',
        'bottoms': 'ملابس سفلية',
        'outerwear': 'ملابس خارجية',
        'shoes': 'أحذية',
        'accessories': 'إكسسوارات'
    };
    
    return translations[category] || category;
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}