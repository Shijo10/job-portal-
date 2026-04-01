// Check if customer is logged in
const customerId = sessionStorage.getItem('customerId');
const customerName = sessionStorage.getItem('customerName');

if (!customerId) {
    window.location.href = '/customer-login';
}

// Display customer name
document.getElementById('customer-name').textContent = customerName || 'Customer';

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '/';
});

// Post new job button
document.getElementById('post-new-job-btn').addEventListener('click', () => {
    window.location.href = '/post-job';
});

// Global variables
let allJobs = [];
let currentFilter = 'all';

// Load jobs on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    setupFilterTabs();
});

// Setup filter tabs
function setupFilterTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current filter
            currentFilter = btn.dataset.filter;
            // Filter and display jobs
            displayJobs(filterJobs(allJobs, currentFilter));
        });
    });
}

// Load jobs from API
async function loadJobs() {
    try {
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        
        const jobs = await response.json();
        
        // Filter jobs for current customer (handle populated ObjectId or raw string)
        allJobs = jobs.filter(job => {
            const jobCustId = job.customerId?._id || job.customerId;
            return jobCustId && jobCustId.toString() === customerId;
        });
        
        // Update stats
        updateStats(allJobs);
        
        // Display jobs
        displayJobs(filterJobs(allJobs, currentFilter));
        
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

// Update statistics
function updateStats(jobs) {
    const total = jobs.length;
    const open = jobs.filter(j => j.status === 'open').length;
    const inProgress = jobs.filter(j => j.status === 'in-progress').length;
    const completed = jobs.filter(j => j.status === 'completed').length;
    
    document.getElementById('total-jobs').textContent = total;
    document.getElementById('open-jobs').textContent = open;
    document.getElementById('in-progress-jobs').textContent = inProgress;
    document.getElementById('completed-jobs').textContent = completed;
}

// Filter jobs by status
function filterJobs(jobs, filter) {
    if (filter === 'all') return jobs;
    return jobs.filter(job => job.status === filter);
}

// Display jobs
function displayJobs(jobs) {
    const container = document.getElementById('jobs-container');
    const emptyState = document.getElementById('empty-state');
    
    if (jobs.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = jobs.map(job => createJobCard(job)).join('');
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.target.closest('.btn-delete').dataset.jobId;
            deleteJob(jobId);
        });
    });
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

    // Budget display
    let budgetDisplay = '';
    if (job.finalPrice) {
        budgetDisplay = `₹${job.finalPrice.toLocaleString('en-IN')} <span style="font-size: 11px; color: #6b7280;">(Accepted bid)</span>`;
    } else if (job.biddingEnabled) {
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

    // Bidding info
    const biddingInfo = job.biddingEnabled && job.status === 'open' && job.totalBids > 0
        ? `<div class="bidding-info">
                <i class="fas fa-gavel"></i>
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
                </div>
                <span class="job-status status-${job.status}">${job.status.replace('-', ' ')}</span>
            </div>

            <p class="job-description">${job.description}</p>

            <div class="job-details">
                <div class="job-detail" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div>
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${job.location}</span>
                    </div>
                    ${job.coordinates && job.coordinates.lat ? `
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.lat},${job.coordinates.lng}" target="_blank" style="padding: 4px 10px; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; color: #4f46e5; background: #e0e7ff; border-radius: 4px; font-weight: 600; border: 1px solid #c7d2fe;">
                        <i class="fas fa-directions"></i> Navigate
                    </a>
                    ` : ''}
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
            </div>

            ${biddingInfo}

            ${job.workerName ? `
                <div class="job-detail" style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-radius: 8px;">
                    <i class="fas fa-user-check"></i>
                    <span><strong>Assigned to:</strong> ${job.workerName}</span>
                </div>
            ` : ''}

            <div class="job-actions">
                ${job.biddingEnabled && job.status === 'open' ? `
                    <button class="btn-view-bids" onclick="viewBids('${job._id}', '${job.title}')">
                        <i class="fas fa-gavel"></i> View Bids ${job.totalBids > 0 ? `(${job.totalBids})` : ''}
                    </button>
                ` : job.status === 'completed' ? `
                    <button class="btn-primary" onclick="window.location.href='/payment?jobId=${job._id}'" style="background:#059669;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;">
                        <i class="fas fa-credit-card"></i> Pay Now
                    </button>
                ` : `
                    <button class="btn-view" onclick="window.location.href='/browse-workers'">
                        <i class="fas fa-users"></i> Browse Workers
                    </button>
                `}
                <button class="btn-delete" data-job-id="${job._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                <i class="fas fa-clock"></i> Posted on ${createdDate}
            </div>
        </div>
    `;
}

// View bids for a job
async function viewBids(jobId, jobTitle) {
    try {
        const response = await fetch(`/api/bids/job/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch bids');

        const bids = await response.json();

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'bids-modal';
        modal.innerHTML = `
            <div class="bids-modal-content">
                <div class="bids-modal-header">
                    <h2><i class="fas fa-gavel"></i> Bids for "${jobTitle}"</h2>
                    <button class="close-modal" onclick="this.closest('.bids-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="bids-modal-body">
                    ${bids.length === 0 ? `
                        <div class="no-bids">
                            <i class="fas fa-inbox"></i>
                            <p>No bids received yet</p>
                        </div>
                    ` : `
                        <div class="bids-list">
                            ${bids.map(bid => createBidCard(bid, jobId)).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

    } catch (error) {
        console.error('Error loading bids:', error);
        alert('Error loading bids. Please try again.');
    }
}

// Create bid card HTML
function createBidCard(bid, jobId) {
    const statusColors = {
        pending: '#fbbf24',
        accepted: '#10b981',
        rejected: '#ef4444',
        withdrawn: '#6b7280'
    };

    const statusColor = statusColors[bid.status] || '#6b7280';

    return `
        <div class="bid-card">
            <div class="bid-header">
                <div class="bid-worker-info">
                    <h3>${bid.workerName}</h3>
                    <div class="bid-worker-meta">
                        <span><i class="fas fa-star"></i> ${bid.workerRating.toFixed(1)}</span>
                        <span><i class="fas fa-briefcase"></i> ${bid.workerExperience} years</span>
                    </div>
                </div>
                <div class="bid-amount">
                    <div class="amount-label">Bid Amount</div>
                    <div class="amount-value">₹${bid.bidAmount.toLocaleString('en-IN')}</div>
                </div>
            </div>

            <div class="bid-details">
                <div class="bid-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${bid.workerEmail}</span>
                </div>
                <div class="bid-detail">
                    <i class="fas fa-phone"></i>
                    <span>${bid.workerPhone}</span>
                </div>
                <div class="bid-detail">
                    <i class="fas fa-clock"></i>
                    <span>Duration: ${bid.estimatedDuration}</span>
                </div>
                <div class="bid-detail">
                    <i class="fas fa-calendar"></i>
                    <span>Available: ${bid.availability}</span>
                </div>
            </div>

            <div class="bid-cover-letter">
                <strong>Cover Letter:</strong>
                <p>${bid.coverLetter}</p>
            </div>

            ${bid.additionalNotes ? `
                <div class="bid-notes">
                    <strong>Additional Notes:</strong>
                    <p>${bid.additionalNotes}</p>
                </div>
            ` : ''}

            <div class="bid-footer">
                <span class="bid-status" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor};">
                    ${bid.status.toUpperCase()}
                </span>
                ${bid.status === 'pending' ? `
                    <div class="bid-actions">
                        <button class="btn-accept-bid" onclick="acceptBid('${bid._id}', '${jobId}')">
                            <i class="fas fa-check"></i> Accept Bid
                        </button>
                        <button class="btn-reject-bid" onclick="rejectBid('${bid._id}', '${jobId}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Accept a bid
async function acceptBid(bidId, jobId) {
    if (!confirm('Are you sure you want to accept this bid? This will assign the job to this worker and reject all other bids.')) {
        return;
    }

    try {
        const response = await fetch(`/api/bids/${bidId}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Bid accepted successfully! The worker has been assigned to the job.');
            // Close modal and reload jobs
            document.querySelector('.bids-modal')?.remove();
            loadJobs();
        } else {
            alert(data.message || 'Failed to accept bid. Please try again.');
        }
    } catch (error) {
        console.error('Error accepting bid:', error);
        alert('Error accepting bid. Please try again.');
    }
}

// Reject a bid
async function rejectBid(bidId, jobId) {
    if (!confirm('Are you sure you want to reject this bid?')) {
        return;
    }

    try {
        const response = await fetch(`/api/bids/${bidId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Bid rejected successfully.');
            // Reload bids in modal
            const modal = document.querySelector('.bids-modal');
            if (modal) {
                modal.remove();
                const jobTitle = modal.querySelector('h2').textContent.split('"')[1];
                viewBids(jobId, jobTitle);
            }
        } else {
            alert(data.message || 'Failed to reject bid. Please try again.');
        }
    } catch (error) {
        console.error('Error rejecting bid:', error);
        alert('Error rejecting bid. Please try again.');
    }
}

// Delete job
async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete job');

        // Reload jobs
        await loadJobs();

        // Show success message (optional)
        alert('Job deleted successfully!');

    } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

