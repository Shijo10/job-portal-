// Global variables
let allJobs = [];
let filteredJobs = [];

// Load jobs on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    setupEventListeners();
    updateNavbarForLoggedInUser();
});

// Check if user is logged in and update navbar
function updateNavbarForLoggedInUser() {
    const workerId = sessionStorage.getItem('workerId');
    const customerId = sessionStorage.getItem('customerId');
    const navLinks = document.getElementById('nav-links');

    if (workerId) {
        // Worker is logged in - add dashboard link
        const dashboardLink = document.createElement('a');
        dashboardLink.href = '/worker-dashboard';
        dashboardLink.className = 'nav-link';
        dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
        navLinks.appendChild(dashboardLink);

        // Add logout button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        navLinks.appendChild(logoutBtn);
    } else if (customerId) {
        // Customer is logged in - add my jobs link
        const myJobsLink = document.createElement('a');
        myJobsLink.href = '/my-jobs';
        myJobsLink.className = 'nav-link';
        myJobsLink.innerHTML = '<i class="fas fa-list"></i> My Jobs';
        navLinks.appendChild(myJobsLink);

        // Add logout button
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
        navLinks.appendChild(logoutBtn);
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
    // Search input
    document.getElementById('search-input').addEventListener('input', applyFilters);

    // Filter dropdowns
    document.getElementById('category-filter').addEventListener('change', applyFilters);
    document.getElementById('budget-filter').addEventListener('change', applyFilters);
    document.getElementById('priority-filter').addEventListener('change', applyFilters);
    document.getElementById('sort-filter').addEventListener('change', applyFilters);

    // Location filter
    document.getElementById('location-filter').addEventListener('input', applyFilters);

    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const view = e.target.dataset.view;
            const container = document.getElementById('jobs-container');

            if (view === 'list') {
                container.classList.add('list-view');
            } else {
                container.classList.remove('list-view');
            }
        });
    });
}

// Load jobs from API
async function loadJobs() {
    try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');

        const jobs = await response.json();

        // Filter only open jobs (not assigned, in-progress, completed, or cancelled)
        allJobs = jobs.filter(job => job.status === 'open');

        // Apply filters and display
        applyFilters();

    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobs-container').innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading jobs. Please try again.</p>
            </div>
        `;
    }
}

// Apply all filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const budgetRange = document.getElementById('budget-filter').value;
    const priority = document.getElementById('priority-filter').value;
    const location = document.getElementById('location-filter').value.toLowerCase();
    const sortBy = document.getElementById('sort-filter').value;

    // Filter jobs
    filteredJobs = allJobs.filter(job => {
        // Search filter
        const matchesSearch = !searchTerm ||
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            job.location.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = category === 'all' || job.category === category;

        // Budget filter
        let matchesBudget = true;
        if (budgetRange !== 'all') {
            if (budgetRange === '50000+') {
                matchesBudget = job.budget >= 50000;
            } else {
                const [min, max] = budgetRange.split('-').map(Number);
                matchesBudget = job.budget >= min && job.budget <= max;
            }
        }

        // Priority filter
        const matchesPriority = priority === 'all' || job.priority === priority;

        // Location filter
        const matchesLocation = !location || job.location.toLowerCase().includes(location);

        return matchesSearch && matchesCategory && matchesBudget && matchesPriority && matchesLocation;
    });

    // Sort jobs
    sortJobs(filteredJobs, sortBy);

    // Display jobs
    displayJobs(filteredJobs);
}

// Sort jobs
function sortJobs(jobs, sortBy) {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

    switch (sortBy) {
        case 'newest':
            jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            jobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'budget-high':
            jobs.sort((a, b) => b.budget - a.budget);
            break;
        case 'budget-low':
            jobs.sort((a, b) => a.budget - b.budget);
            break;
        case 'priority':
            jobs.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
    }
}

// Display jobs
function displayJobs(jobs) {
    const container = document.getElementById('jobs-container');
    const emptyState = document.getElementById('empty-state');
    const jobCount = document.getElementById('job-count');

    // Update count
    jobCount.textContent = jobs.length;

    if (jobs.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = jobs.map(job => createJobCard(job)).join('');
}

// Create job card HTML
function createJobCard(job) {
    const createdDate = new Date(job.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const deadline = job.deadline
        ? new Date(job.deadline).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
        : 'No deadline';

    // Budget display - show range if bidding enabled
    let budgetDisplay = '';
    if (job.biddingEnabled) {
        if (job.minBudget && job.maxBudget) {
            budgetDisplay = `₹${job.minBudget.toLocaleString('en-IN')} - ₹${job.maxBudget.toLocaleString('en-IN')}`;
        } else if (job.maxBudget) {
            budgetDisplay = `Up to ₹${job.maxBudget.toLocaleString('en-IN')}`;
        } else {
            budgetDisplay = 'Open to bids';
        }
    } else {
        budgetDisplay = `₹${job.budget.toLocaleString('en-IN')}`;
    }

    // Bidding badge
    const biddingBadge = job.biddingEnabled && job.status === 'open'
        ? `<span class="bidding-badge"><i class="fas fa-gavel"></i> Bidding Open</span>`
        : '';

    // Total bids display
    const totalBidsDisplay = job.biddingEnabled && job.totalBids > 0
        ? `<div class="job-detail">
                <i class="fas fa-users"></i>
                <span>${job.totalBids} bid${job.totalBids !== 1 ? 's' : ''} received</span>
           </div>`
        : '';

    return `
        <div class="job-card">
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <span class="job-category">${job.category}</span>
                    <span class="priority-badge priority-${job.priority}">
                        <i class="fas fa-flag"></i> ${job.priority}
                    </span>
                    ${biddingBadge}
                </div>
                <span class="job-status status-${job.status}">${job.status}</span>
            </div>

            <div class="job-customer">
                <i class="fas fa-user"></i>
                <span>Posted by: <strong>${job.customerName}</strong></span>
            </div>

            <p class="job-description">${job.description}</p>

            <div class="job-details">
                <div class="job-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location}</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-rupee-sign"></i>
                    <strong>${budgetDisplay}</strong>
                </div>
                <div class="job-detail">
                    <i class="fas fa-clock"></i>
                    <span>${job.duration || 'Not specified'}</span>
                </div>
                <div class="job-detail">
                    <i class="fas fa-calendar"></i>
                    <span>${deadline}</span>
                </div>
                ${totalBidsDisplay}
            </div>

            <div class="job-footer">
                <div class="job-posted">
                    <i class="fas fa-clock"></i>
                    Posted on ${createdDate}
                </div>
                ${job.biddingEnabled ? `
                <div class="simple-bid-container" style="display: flex; flex-direction: column; gap: 5px; width: 100%; margin-top: 10px;">
                    <small style="color: #666;">Customer Budget: <strong>${budgetDisplay}</strong></small>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="bid-amount-${job._id}" placeholder="Your Bid (₹)" class="form-control" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" min="0">
                        <button class="btn-primary" onclick="submitSimpleBid('${job._id}')" style="padding: 8px 16px;">
                            <i class="fas fa-gavel"></i> Place Bid
                        </button>
                    </div>
                </div>
                ` : `
                <button class="btn-apply" onclick="applyForJob('${job._id}', '${job.title}')" style="width: 100%; margin-top: 10px;">
                    <i class="fas fa-briefcase"></i> Apply Now
                </button>
                `}
            </div>
        </div>
    `;
}

// Apply for job
function applyForJob(jobId, jobTitle) {
    // Check if worker is logged in
    const workerId = sessionStorage.getItem('workerId');

    if (!workerId) {
        // If not logged in, redirect to worker login
        if (confirm(`Please login as a worker to apply for "${jobTitle}". Would you like to login now?`)) {
            window.location.href = '/worker-login';
        }
        return;
    }

    // Redirect to application page with job ID
    window.location.href = `/apply-job?jobId=${jobId}`;
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = 'all';
    document.getElementById('budget-filter').value = 'all';
    document.getElementById('priority-filter').value = 'all';
    document.getElementById('location-filter').value = '';
    document.getElementById('sort-filter').value = 'newest';

    applyFilters();
}



// Simple Bid System Submission
async function submitSimpleBid(jobId) {
    const workerId = sessionStorage.getItem('workerId');
    if (!workerId) {
        if (confirm('Please login as a worker to place a bid. Login now?')) {
            window.location.href = '/worker-login';
        }
        return;
    }

    const bidInput = document.getElementById(`bid-amount-${jobId}`);
    if (!bidInput || !bidInput.value) {
        alert('Please enter your bid amount.');
        return;
    }
    const amount = parseFloat(bidInput.value);

    try {
        const workerResponse = await fetch(`/api/workers/${workerId}`);
        const worker = await workerResponse.json();

        const bidData = {
            jobId: jobId,
            workerId: worker._id,
            workerName: worker.name,
            workerEmail: worker.email,
            workerPhone: worker.phone,
            workerExperience: worker.experience,
            workerRating: worker.rating,
            bidAmount: amount,
            estimatedDuration: 'To be discussed',
            coverLetter: 'This is a quick bid placed directly from the job board. I am fully available and ready to start immediately. Please review my profile for details.',
            availability: new Date().toISOString().split('T')[0],
            additionalNotes: '',
            status: 'pending'
        };

        const response = await fetch('/api/bids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bidData)
        });

        if (response.ok) {
            alert('Bid placed successfully!');
            bidInput.value = '';
        } else {
            const err = await response.json();
            alert(err.message || 'Failed to place bid');
        }
    } catch (e) {
        console.error(e);
        alert('Error placing bid');
    }
}
