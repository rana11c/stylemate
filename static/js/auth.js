// Styler - Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Initialize registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    // Simple validation
    if (!email || !password) {
        showFormError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading-spinner-small"></span> جاري تسجيل الدخول...';
    submitButton.disabled = true;
    
    // In a real app, this would be an API call
    // For now, submit the form directly
    this.submit();
}

// Handle registration form submission
function handleRegistration(event) {
    event.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Simple validation
    if (!username || !email || !password) {
        showFormError('يرجى إدخال جميع الحقول المطلوبة');
        return;
    }
    
    if (password !== confirmPassword) {
        showFormError('كلمات المرور غير متطابقة');
        return;
    }
    
    if (password.length < 6) {
        showFormError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading-spinner-small"></span> جاري إنشاء الحساب...';
    submitButton.disabled = true;
    
    // In a real app, this would be an API call
    // For now, submit the form directly
    this.submit();
}

// Show form error message
function showFormError(message) {
    const errorElement = document.querySelector('.auth-error');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        // Create error element if it doesn't exist
        const form = document.querySelector('form');
        const newErrorElement = document.createElement('div');
        newErrorElement.className = 'auth-error error-message';
        newErrorElement.textContent = message;
        
        // Insert after the heading
        const heading = document.querySelector('.auth-title');
        if (heading && heading.nextSibling) {
            form.insertBefore(newErrorElement, heading.nextSibling);
        } else {
            form.insertBefore(newErrorElement, form.firstChild);
        }
    }
}
