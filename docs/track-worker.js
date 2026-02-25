// Global variables
let map;
let workerMarker;
let destinationMarker;
let routePath;
let directionsService;
let directionsRenderer;

// Worker and job data
let workerData = {
    name: 'Rajesh Kumar',
    category: 'Plumbing',
    phone: '+91 98765 43210',
    currentLocation: { lat: 12.9716, lng: 77.5946 }, // Bangalore
    speed: 0
};

let jobData = {
    title: 'Fix Kitchen Sink',
    location: 'Koramangala, Bangalore',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    scheduledTime: new Date()
};

// Initialize map
function initMap() {
    // Create map centered on Bangalore
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: workerData.currentLocation,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    // Initialize directions service
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#059669',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });

    // Create worker marker (moving)
    workerMarker = new google.maps.Marker({
        position: workerData.currentLocation,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#059669',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
        },
        title: 'Worker Location'
    });

    // Create destination marker
    destinationMarker = new google.maps.Marker({
        position: jobData.coordinates,
        map: map,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                    <path fill="#ef4444" d="M20 0C8.954 0 0 8.954 0 20c0 14 20 30 20 30s20-16 20-30C40 8.954 31.046 0 20 0z"/>
                    <circle fill="#ffffff" cx="20" cy="20" r="8"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
        },
        title: 'Job Location'
    });

    // Calculate and display route
    calculateRoute();

    // Start simulating worker movement
    startLocationUpdates();

    // Load worker and job data
    loadWorkerData();
    loadJobData();
}

// Calculate route between worker and destination
function calculateRoute() {
    const request = {
        origin: workerData.currentLocation,
        destination: jobData.coordinates,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Update ETA and distance
            const route = result.routes[0].legs[0];
            updateETA(route.duration.text, route.distance.text);
        }
    });
}

// Update ETA display
function updateETA(duration, distance) {
    document.getElementById('eta-time').textContent = duration;
    document.getElementById('distance').textContent = distance;
}

// Simulate worker location updates
function startLocationUpdates() {
    setInterval(() => {
        // Simulate movement towards destination
        const currentLat = workerData.currentLocation.lat;
        const currentLng = workerData.currentLocation.lng;
        const destLat = jobData.coordinates.lat;
        const destLng = jobData.coordinates.lng;

        // Move 0.1% closer to destination each update
        const newLat = currentLat + (destLat - currentLat) * 0.001;
        const newLng = currentLng + (destLng - currentLng) * 0.001;

        workerData.currentLocation = { lat: newLat, lng: newLng };
        workerData.speed = Math.floor(Math.random() * 20) + 30; // 30-50 km/h

        // Update marker position
        workerMarker.setPosition(workerData.currentLocation);

        // Update speed display
        document.getElementById('speed').textContent = `${workerData.speed} km/h`;

        // Recalculate route
        calculateRoute();

    }, 5000); // Update every 5 seconds
}

// Load worker data
function loadWorkerData() {
    document.getElementById('worker-name').textContent = workerData.name;
    document.getElementById('worker-category').innerHTML = `<i class="fas fa-tools"></i> ${workerData.category}`;
    document.getElementById('worker-phone').innerHTML = `<i class="fas fa-phone"></i> ${workerData.phone}`;
}

// Load job data
function loadJobData() {
    document.getElementById('job-title').textContent = jobData.title;
    document.getElementById('job-location').textContent = jobData.location;
    document.getElementById('job-time').textContent = jobData.scheduledTime.toLocaleString('en-IN');
}

// Map control functions
function centerOnWorker() {
    map.panTo(workerData.currentLocation);
    map.setZoom(15);
}

function centerOnDestination() {
    map.panTo(jobData.coordinates);
    map.setZoom(15);
}

function showFullRoute() {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(workerData.currentLocation);
    bounds.extend(jobData.coordinates);
    map.fitBounds(bounds);
}

// Action functions
function callWorker() {
    window.location.href = `tel:${workerData.phone}`;
}

function messageWorker() {
    // Get worker ID from URL or session
    const urlParams = new URLSearchParams(window.location.search);
    const workerId = urlParams.get('workerId');

    if (workerId) {
        window.location.href = `/chat?workerId=${workerId}`;
    } else {
        alert('Opening chat with worker...');
    }
}

// Initialize map when page loads
window.addEventListener('load', () => {
    // Check if Google Maps API is loaded
    if (typeof google !== 'undefined') {
        initMap();
    } else {
        console.error('Google Maps API not loaded. Please add your API key.');
        document.getElementById('map').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 2rem; text-align: center;">
                <i class="fas fa-map-marked-alt" style="font-size: 48px; color: #d1d5db; margin-bottom: 1rem;"></i>
                <h3 style="color: #1f2937; margin-bottom: 0.5rem;">Map Not Available</h3>
                <p style="color: #6b7280; font-size: 14px;">Please add your Google Maps API key to enable live tracking.</p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 1rem;">
                    Get your API key from:
                    <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" style="color: #059669;">
                        Google Cloud Console
                    </a>
                </p>
            </div>
        `;
    }
});

