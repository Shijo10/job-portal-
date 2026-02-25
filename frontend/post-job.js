// Check if customer is logged in
const customerId = sessionStorage.getItem('customerId');
const customerName = sessionStorage.getItem('customerName');

if (!customerId) {
    // Redirect to login if not logged in
    window.location.href = '/customer-login';
}

// Display customer name
document.getElementById('customer-name').textContent = customerName || 'Customer';

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/';
});

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('deadline').setAttribute('min', today);

// Bidding toggle functionality
const biddingToggle = document.getElementById('bidding-enabled');
const biddingFields = document.getElementById('bidding-fields');

biddingToggle.addEventListener('change', () => {
    if (biddingToggle.checked) {
        biddingFields.style.display = 'block';
    } else {
        biddingFields.style.display = 'none';
    }
});

// Form submission
document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Hide previous messages
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');
    
    // Get form data
    const budget = parseInt(document.getElementById('budget').value);
    const biddingEnabled = document.getElementById('bidding-enabled').checked;
    const minBudget = document.getElementById('min-budget').value;
    const maxBudget = document.getElementById('max-budget').value;

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        location: document.getElementById('location').value,
        budget: budget,
        biddingEnabled: biddingEnabled,
        minBudget: minBudget ? parseInt(minBudget) : null,
        maxBudget: maxBudget ? parseInt(maxBudget) : (biddingEnabled ? budget : null),
        duration: document.getElementById('duration').value,
        priority: document.getElementById('priority').value,
        deadline: document.getElementById('deadline').value || null,
        customerId: customerId,
        customerName: customerName,
        status: 'open'
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const job = await response.json();
            successMessage.textContent = 'Job posted successfully! Redirecting to your jobs...';
            successMessage.classList.add('show');

            // Reset form
            document.getElementById('jobForm').reset();

            // Redirect to my jobs page after 2 seconds
            setTimeout(() => {
                window.location.href = '/my-jobs';
            }, 2000);
        } else {
            const error = await response.json();
            errorMessage.textContent = error.message || 'Failed to post job. Please try again.';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Error posting job:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.add('show');
    }
});

