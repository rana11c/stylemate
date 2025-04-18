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
    
    // صافي مجموعة ملابس الخزانة لاختيار القطع للإطلالة
    loadClosetItemsForOutfit();
}

// تحميل قطع الملابس من الخزانة
function loadClosetItemsForOutfit() {
    const itemsContainer = document.getElementById('outfit-items-selection');
    
    if (!itemsContainer) return;
    
    // عرض حالة التحميل
    itemsContainer.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
        </div>
    `;
    
    // جلب قطع الملابس من الخزانة
    fetch('/closet/items')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.items && data.items.length > 0) {
                // إنشاء محتوى HTML للعناصر
                let itemsHTML = '';
                
                // تصنيف العناصر حسب الفئة
                const categories = {
                    'tops': [],
                    'bottoms': [],
                    'outerwear': [],
                    'shoes': [],
                    'accessories': []
                };
                
                // تصنيف العناصر
                data.items.forEach(item => {
                    if (categories[item.category]) {
                        categories[item.category].push(item);
                    } else {
                        categories['accessories'].push(item);
                    }
                });
                
                // إنشاء عناصر HTML لكل فئة
                Object.keys(categories).forEach(category => {
                    if (categories[category].length > 0) {
                        itemsHTML += `
                            <div class="items-category">
                                <h3>${translateCategory(category)}</h3>
                                <div class="items-grid">
                        `;
                        
                        categories[category].forEach(item => {
                            itemsHTML += `
                                <div class="closet-item" data-id="${item.id}" data-category="${item.category}">
                                    <div class="closet-item-inner">
                                        <img src="${item.image_url}" alt="${item.name}">
                                        <div class="item-select">
                                            <input type="checkbox" id="item-${item.id}" name="outfit_items" value="${item.id}">
                                            <label for="item-${item.id}"></label>
                                        </div>
                                    </div>
                                    <div class="item-name">${item.name}</div>
                                </div>
                            `;
                        });
                        
                        itemsHTML += `
                                </div>
                            </div>
                        `;
                    }
                });
                
                // تحديث الحاوية
                itemsContainer.innerHTML = itemsHTML;
                
                // إضافة معالجات الأحداث للعناصر
                const items = document.querySelectorAll('.closet-item');
                items.forEach(item => {
                    item.addEventListener('click', function(e) {
                        // تجاهل النقر على مربع الاختيار نفسه
                        if (e.target.type === 'checkbox') return;
                        
                        // تبديل حالة الاختيار
                        const checkbox = this.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                        
                        // تحديث معاينة الإطلالة
                        updateOutfitPreview();
                    });
                });
                
                // فعّل معاينة الإطلالة الأولية
                updateOutfitPreview();
                
            } else {
                // عرض رسالة خطأ
                itemsContainer.innerHTML = `
                    <div class="empty-state">
                        <p>لم يتم العثور على قطع ملابس في خزانتك</p>
                        <a href="/closet" class="btn btn-primary">إضافة ملابس للخزانة</a>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error loading closet items:', error);
            
            // عرض رسالة خطأ
            itemsContainer.innerHTML = `
                <div class="empty-state">
                    <p>حدث خطأ أثناء تحميل قطع الملابس</p>
                    <button class="btn btn-primary" onclick="loadClosetItemsForOutfit()">إعادة المحاولة</button>
                </div>
            `;
        });
}

// تحديث معاينة الإطلالة
function updateOutfitPreview() {
    const previewContainer = document.getElementById('outfit-preview');
    if (!previewContainer) return;
    
    // الحصول على العناصر المحددة
    const selectedItems = Array.from(document.querySelectorAll('input[name="outfit_items"]:checked'));
    
    if (selectedItems.length === 0) {
        // لا توجد عناصر محددة
        previewContainer.innerHTML = `
            <div class="empty-preview">
                <p>لم يتم اختيار أي قطع ملابس</p>
                <span>اختر القطع من الأسفل لرؤية المعاينة</span>
            </div>
        `;
        return;
    }
    
    // إنشاء HTML للمعاينة
    let previewHTML = `<div class="preview-items-grid">`;
    
    // نرتب القطع حسب الفئة
    const categoryOrder = ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'];
    const selectedByCategory = {};
    
    // تصنيف العناصر المحددة
    selectedItems.forEach(item => {
        const itemElement = item.closest('.closet-item');
        const category = itemElement.getAttribute('data-category');
        const id = itemElement.getAttribute('data-id');
        const image = itemElement.querySelector('img').src;
        const name = itemElement.querySelector('.item-name').textContent;
        
        if (!selectedByCategory[category]) {
            selectedByCategory[category] = [];
        }
        
        selectedByCategory[category].push({
            id: id,
            image: image,
            name: name
        });
    });
    
    // إضافة العناصر المحددة للمعاينة حسب الترتيب
    categoryOrder.forEach(category => {
        if (selectedByCategory[category] && selectedByCategory[category].length > 0) {
            selectedByCategory[category].forEach(item => {
                previewHTML += `
                    <div class="preview-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="preview-item-category">${translateCategory(category)}</div>
                    </div>
                `;
            });
        }
    });
    
    previewHTML += `</div>`;
    
    // تحديث الحاوية
    previewContainer.innerHTML = previewHTML;
}

// حفظ الإطلالة
function saveOutfit() {
    // التحقق من صحة النموذج
    const outfitName = document.getElementById('outfit-name').value.trim();
    const selectedItems = Array.from(document.querySelectorAll('input[name="outfit_items"]:checked'));
    
    if (!outfitName) {
        showFlashMessage('يرجى إدخال اسم للإطلالة', 'error');
        return;
    }
    
    if (selectedItems.length === 0) {
        showFlashMessage('يرجى اختيار قطع الملابس للإطلالة', 'error');
        return;
    }
    
    // جمع بيانات الإطلالة
    const outfitData = {
        name: outfitName,
        temperature: document.getElementById('outfit-temp').value,
        weather_condition: document.getElementById('outfit-weather').value,
        items: selectedItems.map(item => parseInt(item.value))
    };
    
    // عرض حالة التحميل
    const submitButton = document.querySelector('#upload-outfit-modal .btn-primary');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    submitButton.disabled = true;
    
    // إرسال البيانات إلى الخادم
    fetch('/outfit/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(outfitData)
    })
    .then(response => response.json())
    .then(data => {
        // إعادة زر الإرسال إلى حالته الطبيعية
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        if (data.status === 'success') {
            // إغلاق النافذة المنبثقة وعرض رسالة نجاح
            showFlashMessage('تم حفظ الإطلالة بنجاح');
            closeModal('upload-outfit-modal');
            
            // إعادة تحميل الإطلالات إذا كنا في صفحة الإطلالات
            if (window.location.pathname.includes('/outfit')) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else {
            // عرض رسالة خطأ
            showFlashMessage(data.message || 'حدث خطأ أثناء حفظ الإطلالة', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving outfit:', error);
        
        // إعادة زر الإرسال إلى حالته الطبيعية
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // عرض رسالة خطأ
        showFlashMessage('حدث خطأ أثناء الاتصال بالخادم', 'error');
    });
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

// Show flash message
function showFlashMessage(message, type = 'success') {
    // Check if the function exists in the global scope
    if (typeof window.showFlashMessage === 'function') {
        // Use the global function
        window.showFlashMessage(message, type);
    } else {
        // Create our own implementation
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
}

// Create flash container if not exists
function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-container';
    document.body.appendChild(container);
    return container;
}