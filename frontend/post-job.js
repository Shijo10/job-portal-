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

// ========== GPS COORDINATES PIPELINE ==========
let currentCoordinates = null;

// Core function to capture GPS and resolve address
async function captureGPS() {
    const gpsBtn = document.getElementById('btn-get-location');
    const statusEl = document.getElementById('gps-status');

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please type your address manually.');
        return;
    }

    if (gpsBtn) gpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                currentCoordinates = { lat, lng };

                if (gpsBtn) gpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resolving Address...';

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                    const data = await res.json();

                    const locationInput = document.getElementById('location');
                    if (data && data.display_name) {
                        const addr = data.address;
                        const shortAddress = [addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(', ');
                        if (!locationInput.value) {
                            locationInput.value = shortAddress || data.display_name;
                        }
                    } else if (!locationInput.value) {
                        locationInput.value = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }
                } catch (e) {
                    console.error("Reverse geocoding failed", e);
                    const locationInput = document.getElementById('location');
                    if (!locationInput.value) {
                        locationInput.value = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }
                }

                if (gpsBtn) gpsBtn.innerHTML = '<i class="fas fa-check-circle"></i> GPS Captured';
                if (gpsBtn) gpsBtn.style.background = '#d1fae5';
                if (gpsBtn) gpsBtn.style.color = '#065f46';
                if (statusEl) statusEl.style.display = 'block';
                resolve(true);
            },
            (error) => {
                console.error('GPS error:', error);
                if (gpsBtn) gpsBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Get GPS';
                resolve(false);
            }
        );
    });
}

// Auto-capture GPS when page loads (silently)
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentCoordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const gpsBtn = document.getElementById('btn-get-location');
                const statusEl = document.getElementById('gps-status');
                if (gpsBtn) {
                    gpsBtn.innerHTML = '<i class="fas fa-check-circle"></i> GPS Captured';
                    gpsBtn.style.background = '#d1fae5';
                    gpsBtn.style.color = '#065f46';
                }
                if (statusEl) statusEl.style.display = 'block';

                // Auto-fill location if empty
                const locationInput = document.getElementById('location');
                if (locationInput && !locationInput.value) {
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentCoordinates.lat}&lon=${currentCoordinates.lng}&zoom=18&addressdetails=1`)
                        .then(r => r.json())
                        .then(data => {
                            if (data && data.display_name && !locationInput.value) {
                                const addr = data.address;
                                const shortAddress = [addr.road, addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(', ');
                                locationInput.value = shortAddress || data.display_name;
                            }
                        })
                        .catch(() => {});
                }
            },
            () => {} // Silently fail on auto-capture; user can click manually
        );
    }
});

// Manual GPS button click
const gpsBtn = document.getElementById('btn-get-location');
if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
        captureGPS();
    });
}

// ========== FORM SUBMISSION ==========
document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Hide previous messages
    errorMessage.classList.remove('show');
    successMessage.classList.remove('show');

    // REQUIRE GPS coordinates
    if (!currentCoordinates) {
        const proceed = confirm(
            'GPS coordinates have not been captured yet!\n\n' +
            'Without GPS, workers will NOT be able to navigate to your location.\n\n' +
            'Click "Cancel" to go back and click "Get GPS", or "OK" to post without navigation.'
        );
        if (!proceed) return;
    }

    // Get form data
    const budget = parseInt(document.getElementById('budget').value);
    const biddingEnabled = document.getElementById('bidding-enabled').checked;
    const maxBudget = document.getElementById('max-budget').value;

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        location: document.getElementById('location').value,
        coordinates: currentCoordinates,
        budget: budget,
        biddingEnabled: biddingEnabled,
        maxBudget: maxBudget ? parseInt(maxBudget) : (biddingEnabled ? budget : null),
        duration: document.getElementById('duration').value,
        priority: document.getElementById('priority').value,
        deadline: document.getElementById('deadline').value || null,
        customerId: customerId,
        customerName: customerName,
        status: 'open'
    };

    try {
        const response = await fetch('/api/jobs', {
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
            currentCoordinates = null;

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
