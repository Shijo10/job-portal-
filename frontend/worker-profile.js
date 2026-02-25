// Get worker ID from URL
const urlParams = new URLSearchParams(window.location.search);
const workerId = urlParams.get('id');

if (!workerId) {
    window.location.href = '/browse-workers';
}

// Load worker profile
document.addEventListener('DOMContentLoaded', () => {
    loadWorkerProfile();
});

async function loadWorkerProfile() {
    const loading = document.getElementById('loading');
    const profileContent = document.getElementById('profile-content');
    
    try {
        // Fetch worker data
        const workerResponse = await fetch(`http://localhost:3000/api/workers/${workerId}`);
        if (!workerResponse.ok) {
            throw new Error('Worker not found');
        }
        const worker = await workerResponse.json();
        
        // Fetch jobs for this worker
        const jobsResponse = await fetch(`http://localhost:3000/api/jobs`);
        const allJobs = await jobsResponse.json();
        const workerJobs = allJobs.filter(job => job.workerId === workerId);
        
        // Display worker profile
        displayWorkerProfile(worker, workerJobs);

        // Setup button handlers
        setupButtonHandlers(worker);

        loading.style.display = 'none';
        profileContent.style.display = 'block';
    } catch (error) {
        console.error('Error loading profile:', error);
        loading.innerHTML = '<i class="fas fa-exclamation-circle"></i><p>Error loading profile. Please try again.</p>';
    }
}

function displayWorkerProfile(worker, jobs) {
    // Avatar
    const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('worker-avatar').textContent = initials;

    // Basic Info
    document.getElementById('worker-name').textContent = worker.name;
    document.getElementById('worker-location').textContent = worker.location;
    document.getElementById('worker-experience').textContent = worker.experience;
    document.getElementById('worker-rate').textContent = worker.hourlyRate;

    // Rating
    const stars = '★'.repeat(Math.floor(worker.rating)) + '☆'.repeat(5 - Math.floor(worker.rating));
    document.getElementById('worker-stars').textContent = stars;
    document.getElementById('worker-rating').textContent = worker.rating.toFixed(1);
    document.getElementById('completed-jobs').textContent = worker.completedJobs;

    // Availability
    const availabilityBadge = document.getElementById('worker-availability');
    availabilityBadge.className = `availability-badge ${worker.availability}`;
    availabilityBadge.textContent = worker.availability.charAt(0).toUpperCase() + worker.availability.slice(1);

    // Skills
    const skillsList = document.getElementById('worker-skills');
    skillsList.innerHTML = worker.skills.map(skill =>
        `<span class="skill-badge">${skill}</span>`
    ).join('');

    // Stats
    document.getElementById('stat-completed').textContent = worker.completedJobs;
    document.getElementById('stat-rating').textContent = worker.rating.toFixed(1);
    document.getElementById('stat-experience').textContent = worker.experience;
    document.getElementById('stat-verified').textContent = worker.verified ? 'Yes' : 'No';

    // Contact Info
    document.getElementById('worker-email').textContent = worker.email;
    document.getElementById('worker-phone').textContent = worker.phone;

    // Location
    document.getElementById('worker-location-full').textContent = worker.location;
    initializeMap(worker.location);

    // Job History
    displayJobHistory(jobs);
}

function initializeMap(location) {
    // Predefined coordinates for Bangalore locations
    const locationCoordinates = {
        'Koramangala, Bangalore': { lat: 12.9352, lng: 77.6245 },
        'Indiranagar, Bangalore': { lat: 12.9716, lng: 77.6412 },
        'Whitefield, Bangalore': { lat: 12.9698, lng: 77.7500 },
        'HSR Layout, Bangalore': { lat: 12.9121, lng: 77.6446 },
        'Electronic City, Bangalore': { lat: 12.8456, lng: 77.6603 },
        'Marathahalli, Bangalore': { lat: 12.9591, lng: 77.6974 },
        'Jayanagar, Bangalore': { lat: 12.9250, lng: 77.5838 },
        'BTM Layout, Bangalore': { lat: 12.9165, lng: 77.6101 },
        'Sarjapur Road, Bangalore': { lat: 12.9010, lng: 77.6870 },
        'Yelahanka, Bangalore': { lat: 13.1007, lng: 77.5963 }
    };

    // Get coordinates for the location or use default Bangalore center
    const position = locationCoordinates[location] || { lat: 12.9716, lng: 77.5946 };

    // Get customer location from session (if logged in)
    const customerLocation = sessionStorage.getItem('customerLocation');

    // Create map using Leaflet (OpenStreetMap)
    const map = L.map('map').setView([position.lat, position.lng], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Create custom green marker icon with pointer cursor
    const greenIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 30px;
            height: 30px;
            background-color: #059669;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            cursor: pointer;
        ">
            <i class="fas fa-map-marker-alt"></i>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    // Add marker
    const marker = L.marker([position.lat, position.lng], { icon: greenIcon }).addTo(map);

    // Function to open Google Maps directions
    const openDirections = () => {
        let directionsUrl;

        if (customerLocation) {
            // If customer is logged in, show directions from customer location to worker location
            directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(customerLocation)}&destination=${encodeURIComponent(location)}&travelmode=driving`;
        } else {
            // If not logged in, just show the worker location on Google Maps
            directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        }

        window.open(directionsUrl, '_blank');
    };

    // Create popup content with click instruction
    const popupContent = customerLocation
        ? `<div style="padding: 10px; font-family: Arial, sans-serif; text-align: center;">
            <strong style="color: #059669; font-size: 14px;">${location}</strong>
            <div style="margin-top: 8px; padding: 8px; background: #f0fdf4; border-radius: 6px; cursor: pointer;" onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(customerLocation)}&destination=${encodeURIComponent(location)}&travelmode=driving', '_blank')">
                <i class="fas fa-directions" style="color: #059669;"></i>
                <span style="color: #059669; font-size: 12px; margin-left: 4px;">Get Directions</span>
            </div>
           </div>`
        : `<div style="padding: 10px; font-family: Arial, sans-serif; text-align: center;">
            <strong style="color: #059669; font-size: 14px;">${location}</strong>
            <div style="margin-top: 8px; padding: 8px; background: #f0fdf4; border-radius: 6px; cursor: pointer;" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}', '_blank')">
                <i class="fas fa-map-marked-alt" style="color: #059669;"></i>
                <span style="color: #059669; font-size: 12px; margin-left: 4px;">View on Google Maps</span>
            </div>
           </div>`;

    // Add popup with location name and directions button
    marker.bindPopup(popupContent).openPopup();

    // Make marker clickable to open directions
    marker.on('click', openDirections);

    // Add circle to highlight the area
    const circle = L.circle([position.lat, position.lng], {
        color: '#059669',
        fillColor: '#059669',
        fillOpacity: 0.1,
        radius: 500
    }).addTo(map);

    // Make circle clickable too
    circle.on('click', openDirections);

    // Add a custom control button for directions
    const DirectionsControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.innerHTML = `
                <a href="#" style="
                    background: #059669;
                    color: white;
                    padding: 8px 12px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    border-radius: 4px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                " title="${customerLocation ? 'Get directions from your location' : 'View on Google Maps'}">
                    <i class="fas fa-${customerLocation ? 'directions' : 'map-marked-alt'}"></i>
                    ${customerLocation ? 'Get Directions' : 'View on Maps'}
                </a>
            `;

            L.DomEvent.on(container, 'click', function(e) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                openDirections();
            });

            return container;
        }
    });

    map.addControl(new DirectionsControl());
}

function displayJobHistory(jobs) {
    const jobHistory = document.getElementById('job-history');
    
    if (jobs.length === 0) {
        jobHistory.innerHTML = `
            <div class="no-jobs">
                <i class="fas fa-briefcase"></i>
                <p>No job history available yet</p>
            </div>
        `;
        return;
    }
    
    // Sort jobs by date (newest first)
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    jobHistory.innerHTML = jobs.map(job => {
        const date = new Date(job.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="job-item">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="job-customer">
                            <i class="fas fa-user"></i>
                            ${job.customerName}
                        </div>
                    </div>
                    <span class="job-status ${job.status}">${job.status.replace('-', ' ')}</span>
                </div>
                <div class="job-description">${job.description}</div>
                <div class="job-meta">
                    <span class="job-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.location}
                    </span>
                    <span class="job-meta-item">
                        <i class="fas fa-rupee-sign"></i>
                        ₹${job.budget}
                    </span>
                    <span class="job-meta-item">
                        <i class="fas fa-calendar"></i>
                        ${date}
                    </span>
                    ${job.duration ? `
                        <span class="job-meta-item">
                            <i class="fas fa-clock"></i>
                            ${job.duration}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Setup button handlers
function setupButtonHandlers(worker) {
    // Contact Worker button
    document.getElementById('contact-worker-btn').addEventListener('click', () => {
        // Redirect to chat page with worker ID
        window.location.href = `/chat?workerId=${worker._id}&workerName=${encodeURIComponent(worker.name)}`;
    });

    // Hire Now button
    document.getElementById('hire-worker-btn').addEventListener('click', () => {
        // Redirect to payment page with worker details
        window.location.href = `/payment?workerId=${worker._id}&workerName=${encodeURIComponent(worker.name)}&hourlyRate=${worker.hourlyRate}`;
    });
}
