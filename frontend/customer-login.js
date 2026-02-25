document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Hide previous messages
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    
    try {
        // Check if customer exists
        const response = await fetch('http://localhost:3000/api/customers');
        const customers = await response.json();
        
        const customer = customers.find(c => 
            c.email.toLowerCase() === email.toLowerCase() && 
            c.phone === phone
        );
        
        if (customer) {
            // Store customer info in sessionStorage
            sessionStorage.setItem('customerId', customer._id);
            sessionStorage.setItem('customerName', customer.name);
            sessionStorage.setItem('customerEmail', customer.email);
            sessionStorage.setItem('customerLocation', customer.location);

            successMessage.textContent = 'Login successful! Redirecting...';
            successMessage.classList.add('show');
            
            // Redirect to post job page
            setTimeout(() => {
                window.location.href = '/post-job';
            }, 1000);
        } else {
            errorMessage.textContent = 'Invalid email or phone number. Please check your credentials or register first.';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
    }
});

