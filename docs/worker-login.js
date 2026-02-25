// Check if worker is already logged in
if (sessionStorage.getItem('workerId')) {
    window.location.href = '/worker-dashboard';
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Handle form submission
document.getElementById('worker-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Hide previous messages
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        showError(emailValidation.message);
        return;
    }

    // Validate password (basic check for login)
    if (!password || password.trim() === '') {
        showError('Please enter your password');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        // Call login API
        const response = await fetch('/api/workers/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store worker session
            sessionStorage.setItem('workerId', data.worker._id);
            sessionStorage.setItem('workerName', data.worker.name);
            sessionStorage.setItem('workerEmail', data.worker.email);
            sessionStorage.setItem('workerCategory', data.worker.category);
            sessionStorage.setItem('workerPhone', data.worker.phone);
            sessionStorage.setItem('workerHourlyRate', data.worker.hourlyRate);
            
            if (rememberMe) {
                localStorage.setItem('workerEmail', email);
            }
            
            // Show success message
            showSuccess('Login successful! Redirecting to dashboard...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/worker-dashboard';
            }, 1500);
        } else {
            showError(data.error || 'Invalid email or password');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorDiv.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    successText.textContent = message;
    successDiv.style.display = 'flex';
}

// Real-time email validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    const validationDiv = document.getElementById('email-validation');

    if (email) {
        const result = validateEmail(email);
        if (result.valid) {
            this.classList.remove('invalid');
            this.classList.add('valid');
            validationDiv.textContent = '✓ Valid email';
            validationDiv.className = 'validation-message success';
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
            validationDiv.textContent = result.message;
            validationDiv.className = 'validation-message error';
        }
    } else {
        this.classList.remove('valid', 'invalid');
        validationDiv.textContent = '';
        validationDiv.className = 'validation-message';
    }
});

// Clear validation on input
document.getElementById('email').addEventListener('input', function() {
    if (this.classList.contains('invalid')) {
        this.classList.remove('invalid');
        document.getElementById('email-validation').textContent = '';
    }
});

// Pre-fill email if remembered
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('workerEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember-me').checked = true;
    }
});

