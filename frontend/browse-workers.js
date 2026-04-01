let allWorkers = [];
let filteredWorkers = [];
let currentCategory = 'all';
let currentSort = 'rating';

// Load workers on page load
document.addEventListener('DOMContentLoaded', () => {
    loadWorkers();
    setupEventListeners();
    updateNavbarForLoggedInUser();
});

// Check if user is logged in and update navbar
function updateNavbarForLoggedInUser() {
    const workerId = sessionStorage.getItem('workerId');
    const customerId = sessionStorage.getItem('customerId');
    const navButtons = document.getElementById('nav-buttons');

    if (workerId) {
        // Worker is logged in - add dashboard link
        const dashboardLink = document.createElement('a');
        dashboardLink.href = '/worker-dashboard';
        dashboardLink.className = 'btn-back';
        dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
        navButtons.appendChild(dashboardLink);

        // Add logout button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'btn-back';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        navButtons.appendChild(logoutBtn);
    } else if (customerId) {
        // Customer is logged in - add my jobs link
        const myJobsLink = document.createElement('a');
        myJobsLink.href = '/my-jobs';
        myJobsLink.className = 'btn-back';
        myJobsLink.innerHTML = '<i class="fas fa-list"></i> My Jobs';
        navButtons.appendChild(myJobsLink);

        // Add logout button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'btn-back';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        navButtons.appendChild(logoutBtn);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        localStorage.removeItem('workerEmail');
        localStorage.removeItem('customerEmail');
        window.location.href = '/';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterAndDisplayWorkers();
        });
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        filterAndDisplayWorkers();
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterAndDisplayWorkers();
    });
}

// Load workers from API
async function loadWorkers() {
    const loading = document.getElementById('loading');
    const workersGrid = document.getElementById('workers-grid');
    
    try {
        loading.style.display = 'block';
        workersGrid.innerHTML = '';
        
        const response = await fetch('/api/workers');
        const data = await response.json();
        
        allWorkers = data;
        filteredWorkers = data;
        
        loading.style.display = 'none';
        filterAndDisplayWorkers();
    } catch (error) {
        console.error('Error loading workers:', error);
        loading.innerHTML = '<i class="fas fa-exclamation-circle"></i><p>Error loading workers. Please try again.</p>';
    }
}

// Filter and display workers
function filterAndDisplayWorkers() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    
    // Filter by category
    filteredWorkers = currentCategory === 'all' 
        ? [...allWorkers]
        : allWorkers.filter(worker => 
            worker.skills.some(skill => skill.toLowerCase().includes(currentCategory.toLowerCase()))
          );
    
    // Filter by search
    if (searchInput) {
        filteredWorkers = filteredWorkers.filter(worker => 
            worker.name.toLowerCase().includes(searchInput) ||
            worker.location.toLowerCase().includes(searchInput) ||
            worker.skills.some(skill => skill.toLowerCase().includes(searchInput))
        );
    }
    
    // Sort workers
    sortWorkers();
    
    // Display workers
    displayWorkers();
}

// Sort workers
function sortWorkers() {
    switch (currentSort) {
        case 'rating':
            filteredWorkers.sort((a, b) => b.rating - a.rating);
            break;
        case 'experience':
            filteredWorkers.sort((a, b) => b.experience - a.experience);
            break;
        case 'rate-low':
            filteredWorkers.sort((a, b) => a.hourlyRate - b.hourlyRate);
            break;
        case 'rate-high':
            filteredWorkers.sort((a, b) => b.hourlyRate - a.hourlyRate);
            break;
        case 'recent':
            filteredWorkers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
}

// Display workers
function displayWorkers() {
    const workersGrid = document.getElementById('workers-grid');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');
    
    if (filteredWorkers.length === 0) {
        workersGrid.innerHTML = '';
        noResults.style.display = 'block';
        resultsCount.textContent = 'No workers found';
        return;
    }
    
    noResults.style.display = 'none';
    resultsCount.textContent = `${filteredWorkers.length} Worker${filteredWorkers.length !== 1 ? 's' : ''} Found`;
    
    workersGrid.innerHTML = filteredWorkers.map(worker => createWorkerCard(worker)).join('');
}

// Create worker card HTML
function createWorkerCard(worker) {
    const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const stars = '★'.repeat(Math.floor(worker.rating)) + '☆'.repeat(5 - Math.floor(worker.rating));

    return `
        <div class="worker-card" onclick="window.location.href='/worker-profile?id=${worker._id}'">
            <div class="worker-header">
                <div class="worker-avatar">${initials}</div>
                <div class="worker-info">
                    <div class="worker-name">${worker.name}</div>
                    <div class="worker-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${worker.location}
                    </div>
                </div>
                <div class="worker-rating">
                    <i class="fas fa-star"></i>
                    ${worker.rating.toFixed(1)}
                </div>
            </div>

            <div class="worker-skills">
                ${worker.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                ${worker.skills.length > 3 ? `<span class="skill-tag">+${worker.skills.length - 3} more</span>` : ''}
            </div>

            <div class="worker-details">
                <div class="worker-stat">
                    <span class="stat-value">${worker.experience}</span>
                    <span class="stat-label">Years Exp</span>
                </div>
                <div class="worker-stat">
                    <span class="stat-value">₹${worker.hourlyRate}</span>
                    <span class="stat-label">Per Hour</span>
                </div>
                <div class="worker-stat">
                    <span class="stat-value">${worker.completedJobs}</span>
                    <span class="stat-label">Jobs Done</span>
                </div>
            </div>
        </div>
    `;
}

