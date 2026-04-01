document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Hide previous messages
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    
    try {
        const response = await fetch('/api/customers/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.customer) {
            // Store customer info in sessionStorage
            sessionStorage.setItem('customerId', data.customer._id);
            sessionStorage.setItem('customerName', data.customer.name);
            sessionStorage.setItem('customerEmail', data.customer.email);
            sessionStorage.setItem('customerLocation', data.customer.location);

            successMessage.textContent = 'Login successful! Redirecting...';
            successMessage.classList.add('show');
            
            // Redirect to post job page
            setTimeout(() => {
                window.location.href = '/post-job';
            }, 1000);
        } else {
            errorMessage.textContent = data.error || data.message || 'Invalid email or password. Please check your credentials or register first.';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
    }
});

