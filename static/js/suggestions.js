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
    
    // تحديث واجهة المستخدم لتعكس نمط الملابس المختار
    const styleCards = document.querySelectorAll('.style-card');
    styleCards.forEach(card => {
        card.classList.remove('active');
    });
    
    // إضافة فئة نشطة إلى البطاقة المختارة
    const clickedCard = event.currentTarget.closest('.style-card');
    if (clickedCard) {
        clickedCard.classList.add('active');
    }
    
    // إظهار قسم الإطلالات المقترحة بناءً على النمط
    const outfitSection = document.getElementById('outfit-section');
    if (outfitSection) {
        outfitSection.style.display = 'block';
    }
    
    // إخفاء الأقسام الأخرى
    document.getElementById('style-section').style.display = 'none';
    document.getElementById('occasion-section').style.display = 'none';
    
    // تحميل إطلالات مقترحة مناسبة للنمط المحدد وظروف الطقس
    loadStyleOutfits(styleId);
    
    // إظهار زر العودة
    const backButton = document.createElement('button');
    backButton.className = 'btn btn-secondary back-btn';
    backButton.innerHTML = '<i class="fas fa-arrow-right"></i> العودة';
    backButton.onclick = function() {
        // إعادة عرض قسم الأنماط والعودة إلى الحالة السابقة
        document.getElementById('style-section').style.display = 'block';
        outfitSection.style.display = 'none';
        this.remove();
    };
    
    const container = document.querySelector('.suggestions-section');
    container.insertBefore(backButton, container.firstChild);
}

// تحميل إطلالات مناسبة للنمط
function loadStyleOutfits(styleId) {
    // قم بتحميل بيانات الطقس أولاً
    fetch('/api/weather')
        .then(response => response.json())
        .then(weatherData => {
            // استخدام بيانات الطقس لاقتراح إطلالات مناسبة
            const temperature = weatherData.today.temp;
            const condition = weatherData.today.condition;
            
            // عرض معلومات الطقس
            const outfitSection = document.getElementById('outfit-section');
            if (outfitSection) {
                const weatherInfo = document.createElement('div');
                weatherInfo.className = 'weather-info-banner';
                weatherInfo.innerHTML = `
                    <div class="weather-condition">
                        <i class="fas fa-sun"></i>
                        <span>${condition} | ${temperature}°</span>
                    </div>
                    <div class="weather-recommendation">
                        إطلالات مقترحة مناسبة للطقس الحالي ونمط ${getStyleName(styleId)}
                    </div>
                `;
                outfitSection.innerHTML = '';
                outfitSection.appendChild(weatherInfo);
                
                // إنشاء محتوى الإطلالات
                const outfitCards = document.createElement('div');
                outfitCards.className = 'suggestion-cards';
                
                // إضافة عنوان
                const sectionHeading = document.createElement('h2');
                sectionHeading.className = 'section-heading';
                sectionHeading.textContent = `إطلالات بنمط ${getStyleName(styleId)}`;
                outfitSection.appendChild(sectionHeading);
                
                // إضافة بطاقات الإطلالات
                // هذه إطلالات عرض توضيحية - في التطبيق الحقيقي ستكون مستندة إلى بيانات فعلية
                for (let i = 0; i < 3; i++) {
                    const outfitCard = createOutfitCard(styleId, i, temperature, condition);
                    outfitCards.appendChild(outfitCard);
                }
                
                outfitSection.appendChild(outfitCards);
            }
        })
        .catch(error => {
            console.error('Error loading weather data:', error);
            showFlashMessage('حدث خطأ أثناء تحميل بيانات الطقس', 'error');
        });
}

// Show outfits for an occasion
function showOccasionOutfits(occasionId) {
    showFlashMessage('جاري تحميل إطلالات المناسبة: ' + occasionId, 'info');
    
    // إخفاء قائمة المناسبات
    const occasionList = document.getElementById('occasion-section');
    if (occasionList) {
        occasionList.style.display = 'none';
    }
    
    // عرض قسم الإطلالات
    const outfitSection = document.getElementById('outfit-section');
    if (outfitSection) {
        outfitSection.style.display = 'block';
        
        // إضافة زر العودة
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-secondary back-btn';
        backButton.innerHTML = '<i class="fas fa-arrow-right"></i> العودة إلى المناسبات';
        backButton.onclick = function() {
            // إعادة عرض قائمة المناسبات
            occasionList.style.display = 'block';
            outfitSection.style.display = 'none';
            this.remove();
        };
        
        // إنشاء محتوى الإطلالات المناسبة
        outfitSection.innerHTML = '';
        outfitSection.appendChild(backButton);
        
        // إضافة عنوان
        const sectionHeading = document.createElement('h2');
        sectionHeading.className = 'section-heading';
        sectionHeading.textContent = `إطلالات مناسبة لـ ${getOccasionName(occasionId)}`;
        outfitSection.appendChild(sectionHeading);
        
        // إضافة بطاقات الإطلالات
        const outfitCards = document.createElement('div');
        outfitCards.className = 'suggestion-cards';
        
        // تحميل بيانات الطقس للحصول على إطلالات مناسبة للمناسبة والطقس معًا
        fetch('/api/weather')
            .then(response => response.json())
            .then(weatherData => {
                const temperature = weatherData.today.temp;
                const condition = weatherData.today.condition;
                
                // إضافة معلومات الطقس
                const weatherInfo = document.createElement('div');
                weatherInfo.className = 'weather-info-banner';
                weatherInfo.innerHTML = `
                    <div class="weather-condition">
                        <i class="fas fa-sun"></i>
                        <span>${condition} | ${temperature}°</span>
                    </div>
                    <div class="weather-recommendation">
                        إطلالات مقترحة مناسبة للطقس الحالي ومناسبة ${getOccasionName(occasionId)}
                    </div>
                `;
                outfitSection.insertBefore(weatherInfo, sectionHeading);
                
                // إضافة أربع إطلالات مقترحة
                for (let i = 0; i < 4; i++) {
                    const outfitCard = createOccasionOutfitCard(occasionId, i, temperature);
                    outfitCards.appendChild(outfitCard);
                }
            })
            .catch(error => {
                console.error('Error loading weather data:', error);
                // إضافة إطلالات بدون بيانات الطقس
                for (let i = 0; i < 4; i++) {
                    const outfitCard = createOccasionOutfitCard(occasionId, i);
                    outfitCards.appendChild(outfitCard);
                }
            });
        
        outfitSection.appendChild(outfitCards);
    }
}

// إنشاء بطاقة إطلالة بناءً على النمط
function createOutfitCard(styleId, index, temperature, condition) {
    const images = {
        'casual': [
            'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        'formal': [
            'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/1096849/pexels-photo-1096849.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        'sport': [
            'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/6311619/pexels-photo-6311619.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/6823167/pexels-photo-6823167.jpeg?auto=compress&cs=tinysrgb&w=600'
        ]
    };
    
    const titles = {
        'casual': ['إطلالة كاجوال يومية', 'إطلالة كاجوال للخروج', 'إطلالة كاجوال للجامعة'],
        'formal': ['إطلالة رسمية للعمل', 'إطلالة رسمية للمناسبات', 'إطلالة شبه رسمية للقاءات'],
        'sport': ['إطلالة رياضية للجري', 'إطلالة رياضية للتمرين', 'إطلالة رياضية للرياضات الخارجية']
    };
    
    const descriptions = {
        'casual': [
            'إطلالة مريحة ومناسبة للأنشطة اليومية والخروجات غير الرسمية',
            'تصميم عصري ومريح مناسب للخروج مع الأصدقاء',
            'إطلالة أنيقة وعملية مناسبة لحضور المحاضرات والأنشطة الجامعية'
        ],
        'formal': [
            'إطلالة أنيقة تناسب بيئة العمل الرسمية والاجتماعات',
            'تصميم راقي مناسب للمناسبات الرسمية والحفلات',
            'مزيج متوازن بين الأناقة والراحة للقاءات شبه الرسمية'
        ],
        'sport': [
            'ملابس مريحة مصممة خصيصًا لرياضة الجري والأنشطة الهوائية',
            'إطلالة رياضية مناسبة لصالة الألعاب الرياضية والتمارين المختلفة',
            'تصميم عملي للأنشطة الرياضية الخارجية ومقاوم للعوامل الجوية'
        ]
    };
    
    // اختيار الصورة والعنوان والوصف بناءً على النمط والمؤشر
    const image = images[styleId][index] || images['casual'][0];
    const title = titles[styleId][index] || 'إطلالة مقترحة';
    const description = descriptions[styleId][index] || 'إطلالة مناسبة للطقس الحالي ونمط ملابسك المفضل';
    
    // إنشاء عنصر HTML للبطاقة
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
        <div class="suggestion-image">
            <img src="${image}" alt="${title}">
        </div>
        <div class="suggestion-details">
            <h3 class="suggestion-title">${title}</h3>
            <p class="suggestion-description">${description}</p>
            <div class="suggestion-meta">
                <span class="suggestion-weather"><i class="fas fa-thermometer-half"></i> مناسبة لدرجة حرارة ${temperature}°</span>
            </div>
            <div class="suggestion-actions">
                <button class="btn btn-primary btn-sm" onclick="saveOutfit(${index + 1})">
                    <i class="fas fa-save"></i> حفظ
                </button>
                <button class="btn btn-secondary btn-sm" onclick="showSimilar(${index + 1})">
                    <i class="fas fa-search"></i> مشابه
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// إنشاء بطاقة إطلالة للمناسبات
function createOccasionOutfitCard(occasionId, index, temperature) {
    const images = {
        'work': [
            'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/3775149/pexels-photo-3775149.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        'education': [
            'https://images.pexels.com/photos/6274712/pexels-photo-6274712.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/2867907/pexels-photo-2867907.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        'party': [
            'https://images.pexels.com/photos/2887766/pexels-photo-2887766.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600'
        ],
        'dinner': [
            'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://images.pexels.com/photos/594610/pexels-photo-594610.jpeg?auto=compress&cs=tinysrgb&w=600'
        ]
    };
    
    const titles = {
        'work': ['إطلالة رسمية للعمل', 'إطلالة شبه رسمية للمكتب'],
        'education': ['إطلالة عملية للجامعة', 'إطلالة كاجوال للدراسة'],
        'party': ['إطلالة أنيقة للحفلات', 'إطلالة عصرية للمناسبات'],
        'dinner': ['إطلالة أنيقة للعشاء', 'إطلالة كاجوال للمطاعم']
    };
    
    const descriptions = {
        'work': [
            'تصميم أنيق ورسمي مناسب للاجتماعات والعمل',
            'إطلالة مريحة ومهنية مناسبة لبيئة العمل اليومية'
        ],
        'education': [
            'ملابس عملية ومريحة مناسبة للمحاضرات والأنشطة الجامعية',
            'إطلالة كاجوال أنيقة مناسبة لأجواء الدراسة'
        ],
        'party': [
            'إطلالة فاخرة وأنيقة مناسبة للحفلات الخاصة والمناسبات',
            'تصميم عصري وجذاب مناسب للمناسبات الاجتماعية'
        ],
        'dinner': [
            'إطلالة راقية مناسبة للعشاء الرسمي والمطاعم الفاخرة',
            'إطلالة أنيقة وكاجوال مناسبة للخروج مع الأصدقاء والعائلة'
        ]
    };
    
    // اختيار الصورة والعنوان والوصف بناءً على المناسبة والمؤشر
    const imageIndex = index % 2; // للتبديل بين صورتين لكل مناسبة
    const image = images[occasionId][imageIndex] || 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600';
    const title = titles[occasionId][imageIndex] || 'إطلالة مقترحة';
    const description = descriptions[occasionId][imageIndex] || 'إطلالة مناسبة للمناسبة المختارة';
    
    // إنشاء عنصر HTML للبطاقة
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
        <div class="suggestion-image">
            <img src="${image}" alt="${title}">
        </div>
        <div class="suggestion-details">
            <h3 class="suggestion-title">${title}</h3>
            <p class="suggestion-description">${description}</p>
            <div class="suggestion-meta">
                ${temperature ? `<span class="suggestion-weather"><i class="fas fa-thermometer-half"></i> مناسبة لدرجة حرارة ${temperature}°</span>` : ''}
            </div>
            <div class="suggestion-actions">
                <button class="btn btn-primary btn-sm" onclick="saveOutfit(${index + 5})">
                    <i class="fas fa-save"></i> حفظ
                </button>
                <button class="btn btn-secondary btn-sm" onclick="showSimilar(${index + 5})">
                    <i class="fas fa-search"></i> مشابه
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// الحصول على اسم النمط بالعربية
function getStyleName(styleId) {
    const styles = {
        'casual': 'كاجوال',
        'formal': 'رسمي',
        'sport': 'رياضي'
    };
    return styles[styleId] || styleId;
}

// الحصول على اسم المناسبة بالعربية
function getOccasionName(occasionId) {
    const occasions = {
        'work': 'العمل والمكتب',
        'education': 'الدراسة والجامعة',
        'party': 'الحفلات والمناسبات',
        'dinner': 'العشاء والمطاعم'
    };
    return occasions[occasionId] || occasionId;
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