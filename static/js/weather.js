// Styler - Weather Integration JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get weather data if we're on the home page
    if (window.location.pathname === '/' || window.location.pathname === '/index') {
        fetchWeatherData();
    }
});

// Fetch weather data from the server
function fetchWeatherData() {
    // For the demo, we'll use the hardcoded weather data that matches the mockup
    // In a real app, this would call a backend API endpoint
    
    // If needed, update any dynamic elements
    updateWeatherBasedRecommendations();
}

// Update outfit recommendations based on weather
function updateWeatherBasedRecommendations() {
    const outfitSection = document.querySelector('.outfit-section');
    
    if (!outfitSection) return;
    
    // For the demo, we'll show the error state from the mockup
    outfitSection.innerHTML = `
        <div class="outfit-error">
            <div>حدث خطأ أثناء تحميل الإطلالة</div>
            <button class="outfit-reload" onclick="reloadOutfit()">إعادة المحاولة</button>
        </div>
    `;
    
    // In a real app, we would fetch outfit recommendations from the server
    // based on the current weather and the user's closet
}

// Get weather-appropriate clothing suggestions
function getWeatherSuggestions(temperature, condition) {
    let suggestions = '';
    
    // Simple logic to suggest clothing based on temperature and weather
    if (temperature >= 30) {
        suggestions = 'ملابس خفيفة وقطنية';
    } else if (temperature >= 20) {
        suggestions = 'ملابس متوسطة السماكة';
    } else if (temperature >= 10) {
        suggestions = 'طبقات خفيفة من الملابس';
    } else {
        suggestions = 'ملابس ثقيلة وطبقات متعددة';
    }
    
    // Add suggestions based on weather condition
    if (condition === 'ممطر' || condition === 'ممطر خفيف') {
        suggestions += ' مع مظلة أو معطف واق من المطر';
    } else if (condition === 'مشمس') {
        suggestions += ' مع قبعة ونظارة شمسية';
    }
    
    return suggestions;
}

// Update current date in Arabic format
function updateCurrentDate() {
    const dateElement = document.querySelector('.current-date');
    if (!dateElement) return;
    
    // This would normally be done server-side with proper localization
    // For demo purposes, we're using the hardcoded Arabic date from the mockup
    dateElement.textContent = 'الاثنين، ١٢ شوال';
}
