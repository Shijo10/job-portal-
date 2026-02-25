// Check if worker is logged in
const workerId = sessionStorage.getItem('workerId');
if (!workerId) {
    alert('Please login as a worker to apply for jobs');
    window.location.href = '/worker-login';
    throw new Error('Not logged in'); // Stop execution
}

// Get worker info
const workerName = sessionStorage.getItem('workerName');
if (document.getElementById('worker-name')) {
    document.getElementById('worker-name').textContent = workerName || 'Worker';
}

// Get job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');

if (!jobId) {
    alert('No job selected');
    window.location.href = '/browse-jobs';
    throw new Error('No job ID'); // Stop execution
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        localStorage.removeItem('workerEmail');
        window.location.href = '/';
    }
}

// Load job details
async function loadJobDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`);
        if (response.ok) {
            const job = await response.json();

            // Display job details
            document.getElementById('job-title').textContent = job.title;
            document.getElementById('job-customer').textContent = job.customerName || (job.customer ? job.customer.name : 'Unknown');
            document.getElementById('job-location').textContent = job.location;

            // Budget display with bidding info
            let budgetText = '';
            let budgetHint = '';

            if (job.biddingEnabled) {
                if (job.minBudget && job.maxBudget) {
                    budgetText = `₹${job.minBudget.toLocaleString('en-IN')} - ₹${job.maxBudget.toLocaleString('en-IN')}`;
                    budgetHint = `Budget range: ₹${job.minBudget.toLocaleString('en-IN')} - ₹${job.maxBudget.toLocaleString('en-IN')}. ${job.totalBids > 0 ? `${job.totalBids} bid(s) already received.` : 'Be the first to bid!'}`;
                } else if (job.maxBudget) {
                    budgetText = `Up to ₹${job.maxBudget.toLocaleString('en-IN')}`;
                    budgetHint = `Maximum budget: ₹${job.maxBudget.toLocaleString('en-IN')}. ${job.totalBids > 0 ? `${job.totalBids} bid(s) already received.` : 'Be the first to bid!'}`;
                } else {
                    budgetText = 'Open to bids';
                    budgetHint = `No budget limit set. ${job.totalBids > 0 ? `${job.totalBids} bid(s) already received.` : 'Be the first to bid!'}`;
                }
            } else {
                budgetText = `₹${job.budget.toLocaleString('en-IN')}`;
                budgetHint = 'Fixed price job';
            }

            document.getElementById('job-budget').textContent = budgetText;
            const budgetHintEl = document.getElementById('budget-hint');
            if (budgetHintEl) {
                budgetHintEl.textContent = budgetHint;
            }
            document.getElementById('job-description').textContent = job.description;

            // Set default proposed rate to worker's hourly rate
            const workerRate = sessionStorage.getItem('workerHourlyRate');
            if (workerRate) {
                document.getElementById('proposed-rate').value = workerRate;
            }

            // Store job data for validation
            window.currentJob = job;
        } else {
            alert('Job not found');
            window.location.href = '/browse-jobs';
        }
    } catch (error) {
        console.error('Error loading job details:', error);
        alert('Error loading job details');
    }
}

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('availability').setAttribute('min', today);

// Handle form submission
document.getElementById('application-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const coverLetter = document.getElementById('cover-letter').value;
    const proposedRate = document.getElementById('proposed-rate').value;
    const estimatedDuration = document.getElementById('estimated-duration').value;
    const availability = document.getElementById('availability').value;
    const additionalNotes = document.getElementById('additional-notes').value;

    // Validate cover letter length
    if (coverLetter.length < 50) {
        alert('Cover letter must be at least 50 characters long');
        return;
    }

    // Validate proposed rate
    if (!proposedRate || parseFloat(proposedRate) <= 0) {
        alert('Please enter a valid bid amount');
        return;
    }

    // Get worker details from session
    const workerEmail = sessionStorage.getItem('workerEmail');
    const workerPhone = sessionStorage.getItem('workerPhone');
    const workerExperience = parseInt(sessionStorage.getItem('workerExperience')) || 0;
    const workerRating = parseFloat(sessionStorage.getItem('workerRating')) || 0;

    // Create bid object
    const bidData = {
        jobId: jobId,
        workerId: workerId,
        workerName: workerName,
        workerEmail: workerEmail,
        workerPhone: workerPhone,
        workerExperience: workerExperience,
        workerRating: workerRating,
        bidAmount: parseFloat(proposedRate),
        estimatedDuration: estimatedDuration,
        coverLetter: coverLetter,
        availability: availability,
        additionalNotes: additionalNotes,
        status: 'pending'
    };

    try {
        const response = await fetch('http://localhost:3000/api/bids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bidData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Bid submitted successfully! The customer will review your bid and contact you soon.');
            window.location.href = '/browse-jobs';
        } else {
            alert(data.message || 'Failed to submit bid. Please try again.');
        }

    } catch (error) {
        console.error('Error submitting bid:', error);
        alert('Error submitting bid. Please try again.');
    }
});

// Initialize
loadJobDetails();

