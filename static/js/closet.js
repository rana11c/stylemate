// Styler - Closet Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize add item form
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddItem);
    }
    
    // Initialize delete item buttons
    const deleteButtons = document.querySelectorAll('.delete-item-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteItem);
    });
    
    // Initialize closet filter
    const filterButtons = document.querySelectorAll('.closet-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterCloset);
    });
});

// Handle adding a new item to the closet
function handleAddItem(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    const color = document.getElementById('item-color').value;
    const imageUrl = document.getElementById('item-image').value;
    
    // Simple validation
    if (!name || !category) {
        showFlashMessage('يرجى إدخال اسم وفئة القطعة', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('#add-item-form button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading-spinner-small"></span> جاري الإضافة...';
    submitButton.disabled = true;
    
    // In a real app, this would be an API call with proper file upload
    // For now, submit the form directly
    this.submit();
}

// Handle deleting an item from the closet
function handleDeleteItem(event) {
    const itemId = this.getAttribute('data-item-id');
    
    if (!confirm('هل أنت متأكد من حذف هذه القطعة من خزانتك؟')) {
        return;
    }
    
    // Show loading state
    this.innerHTML = '<span class="loading-spinner-small"></span>';
    this.disabled = true;
    
    // Get the form and submit it
    const form = document.getElementById(`delete-form-${itemId}`);
    if (form) {
        form.submit();
    }
}

// Handle filtering closet items by category
function handleFilterCloset(event) {
    const category = this.getAttribute('data-category');
    
    // Remove active class from all filter buttons
    document.querySelectorAll('.closet-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    this.classList.add('active');
    
    // Filter items
    const closetItems = document.querySelectorAll('.closet-item');
    
    closetItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Open add item modal
function openAddItemModal() {
    openModal('add-item-modal');
}

// Upload and preview image
function previewImage(input) {
    const preview = document.getElementById('image-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Analyze closet items to get style insights
function analyzeCloset() {
    // Show loading state
    const analysisSection = document.querySelector('.closet-analysis');
    
    if (!analysisSection) return;
    
    analysisSection.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>جاري تحليل خزانة ملابسك...</p>
        </div>
    `;
    
    // In a real app, this would call the backend API to analyze the closet
    // For demo, we'll just simulate a delay
    setTimeout(() => {
        analysisSection.innerHTML = `
            <div class="card">
                <h3>تحليل خزانة ملابسك</h3>
                <p>بناءً على قطع ملابسك، يبدو أن أسلوبك المفضل هو الأسلوب الكاجوال العصري.</p>
                <p>يمكنك إضافة المزيد من القطع ذات الألوان الداكنة لتنويع خياراتك.</p>
                <div class="closet-stats">
                    <div class="stat-item">
                        <div class="stat-value">6</div>
                        <div class="stat-label">قطع علوية</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">4</div>
                        <div class="stat-label">قطع سفلية</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">2</div>
                        <div class="stat-label">أحذية</div>
                    </div>
                </div>
            </div>
        `;
    }, 2000);
}
