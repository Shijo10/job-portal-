// Check if worker is logged in
const workerId = sessionStorage.getItem('workerId');
if (!workerId) {
    window.location.href = '/worker-login';
}

// Load worker data
const workerName = sessionStorage.getItem('workerName');
const workerEmail = sessionStorage.getItem('workerEmail');
const workerCategory = sessionStorage.getItem('workerCategory');
const workerPhone = sessionStorage.getItem('workerPhone');
const workerHourlyRate = sessionStorage.getItem('workerHourlyRate');

// Display worker info
document.getElementById('worker-name').textContent = workerName || 'Worker';
document.getElementById('profile-name').textContent = workerName || 'Worker Name';
document.getElementById('profile-category').innerHTML = `<i class="fas fa-tools"></i> ${workerCategory || 'Category'}`;
document.getElementById('profile-email').innerHTML = `<i class="fas fa-envelope"></i> ${workerEmail || 'email@example.com'}`;
document.getElementById('profile-phone').innerHTML = `<i class="fas fa-phone"></i> ${workerPhone || '+91 XXXXXXXXXX'}`;
document.getElementById('stat-rate').textContent = `₹${workerHourlyRate || '0'}/hr`;

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        localStorage.removeItem('workerEmail');
        window.location.href = '/';
    }
}

// Edit profile function
function editProfile() {
    alert('Profile editing feature coming soon!');
}

// Load worker profile data from API
async function loadWorkerProfile() {
    try {
        const response = await fetch(`/api/workers/${workerId}`);
        if (response.ok) {
            const worker = await response.json();
            
            // Update profile info
            document.getElementById('profile-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${worker.location || 'Location'}`;
            document.getElementById('stat-rating').textContent = worker.rating ? worker.rating.toFixed(1) : '0.0';
            document.getElementById('stat-completed').textContent = worker.completedJobs || '0';
        }
    } catch (error) {
        console.error('Error loading worker profile:', error);
    }
}

// Load worker jobs
async function loadWorkerJobs(status = 'all') {
    const jobsContainer = document.getElementById('jobs-container');
    const noJobsDiv = document.getElementById('no-jobs');
    const workerId = sessionStorage.getItem('workerId');

    try {
        // Show loading state
        jobsContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your jobs...</p>
            </div>
        `;

        // Fetch all jobs
        const response = await fetch('/api/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');

        const allJobs = await response.json();

        // Filter jobs assigned to this worker (handle populated ObjectId or raw string)
        let workerJobs = allJobs.filter(job => {
            const currentWorkerId = job.workerId?._id || job.workerId;
            return currentWorkerId && currentWorkerId.toString() === workerId;
        });

        // Apply status filter
        if (status !== 'all') {
            workerJobs = workerJobs.filter(job => {
                if (status === 'pending') return job.status === 'assigned';
                if (status === 'in-progress') return job.status === 'in-progress';
                if (status === 'completed') return job.status === 'completed';
                return true;
            });
        }

        // Clear container
        jobsContainer.innerHTML = '';

        if (workerJobs.length === 0) {
            noJobsDiv.style.display = 'flex';
            noJobsDiv.style.flexDirection = 'column';
            noJobsDiv.style.alignItems = 'center';
            return;
        }

        noJobsDiv.style.display = 'none';

        // Calculate progress stats
        const totalJobs = workerJobs.length;
        const completedJobs = workerJobs.filter(j => j.status === 'completed').length;
        const inProgressJobs = workerJobs.filter(j => j.status === 'in-progress').length;
        const pendingJobs = workerJobs.filter(j => j.status === 'assigned').length;
        const progressPercentage = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

        // Add progress summary
        const progressHTML = `
            <div class="jobs-progress-summary">
                <h3><i class="fas fa-chart-line"></i> Progress Overview</h3>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-stats">
                    <div class="progress-stat">
                        <span class="stat-number">${totalJobs}</span>
                        <span class="stat-label">Total Jobs</span>
                    </div>
                    <div class="progress-stat completed">
                        <span class="stat-number">${completedJobs}</span>
                        <span class="stat-label">Completed</span>
                    </div>
                    <div class="progress-stat in-progress">
                        <span class="stat-number">${inProgressJobs}</span>
                        <span class="stat-label">In Progress</span>
                    </div>
                    <div class="progress-stat pending">
                        <span class="stat-number">${pendingJobs}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                </div>
            </div>
        `;

        jobsContainer.innerHTML = progressHTML;

        // Display job cards
        workerJobs.forEach(job => {
            const jobCard = createJobCard(job);
            jobsContainer.innerHTML += jobCard;
        });

    } catch (error) {
        console.error('Error loading jobs:', error);
        jobsContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading jobs. Please try again.</p>
            </div>
        `;
    }
}

// Create job card HTML
function createJobCard(job) {
    const statusIcons = {
        'assigned': 'fa-clock',
        'in-progress': 'fa-spinner',
        'completed': 'fa-check-circle',
        'cancelled': 'fa-times-circle'
    };

    const statusLabels = {
        'assigned': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };

    const createdDate = new Date(job.createdAt).toLocaleDateString('en-IN');

    return `
        <div class="job-card ${job.status}">
            <div class="job-header">
                <h3>${job.title}</h3>
                <span class="job-status ${job.status}">
                    <i class="fas ${statusIcons[job.status] || 'fa-info-circle'}"></i>
                    ${statusLabels[job.status] || job.status}
                </span>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-details">
                <div><i class="fas fa-user"></i> ${job.customerName}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                    ${job.coordinates && job.coordinates.lat ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.lat},${job.coordinates.lng}" target="_blank" style="padding: 2px 8px; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; color: #4f46e5; background: #e0e7ff; border-radius: 4px;"><i class="fas fa-directions"></i> Navigate</a>` : ''}
                </div>
                <div><i class="fas fa-rupee-sign"></i> ₹${job.budget.toLocaleString()}</div>
                ${job.duration ? `<div><i class="fas fa-clock"></i> ${job.duration}</div>` : ''}
            </div>
            <div class="job-footer">
                <div class="job-posted">
                    <i class="fas fa-calendar"></i> Posted: ${createdDate}
                </div>
                ${job.status !== 'completed' && job.status !== 'cancelled' ? `
                    <button class="btn-update-status" onclick="updateJobStatus('${job._id}', '${job.status}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Update job status
async function updateJobStatus(jobId, currentStatus) {
    const nextStatus = {
        'assigned': 'in-progress',
        'in-progress': 'completed'
    };

    const newStatus = nextStatus[currentStatus];
    if (!newStatus) return;

    const confirmMessage = newStatus === 'in-progress'
        ? 'Mark this job as In Progress?'
        : 'Mark this job as Completed?';

    if (!confirm(confirmMessage)) return;

    try {
        const response = await fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert(`Job status updated to ${newStatus}!`);
            loadWorkerJobs(); // Reload jobs

            // Show payment option popup for worker when completed
            if (newStatus === 'completed') {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.style.display = 'flex';
                modal.style.zIndex = '9999';
                modal.innerHTML = `
                    <div class="modal-content" style="text-align: center; max-width: 400px; padding: 30px;">
                        <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981; margin-bottom: 20px;"></i>
                        <h2 style="margin-bottom: 10px;">Job Completed!</h2>
                        <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                            You have successfully marked the job as completed. A payment option has been generated for the customer. 
                            Would you like to send a quick payment reminder?
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button class="btn-secondary" onclick="this.closest('.modal').remove()">Later</button>
                            <button class="btn-primary" onclick="alert('Payment Reminder sent successfully!'); this.closest('.modal').remove()">
                                <i class="fas fa-paper-plane"></i> Send Request
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        } else {
            alert('Failed to update job status. Please try again.');
        }
    } catch (error) {
        console.error('Error updating job status:', error);
        alert('An error occurred. Please try again.');
    }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Load jobs with filter
        const status = btn.dataset.status;
        loadWorkerJobs(status);
    });
});

// Calendar functionality
let currentDate = new Date();
let scheduledDates = []; // Will be populated with job dates

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarGrid.appendChild(day);
    }

    // Add current month's days
    const today = new Date();
    const workerId = sessionStorage.getItem('workerId');
    const storageKey = `workSchedules_${workerId}`;
    const workSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        // Check if it's today
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            day.classList.add('today');
        }

        // Check if there's work scheduled for this date
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayWork = workSchedules.filter(work => work.date === dateStr);

        if (dayWork.length > 0) {
            day.classList.add('has-work');

            // Add status class
            const hasScheduled = dayWork.some(w => w.status === 'scheduled');
            const hasCompleted = dayWork.some(w => w.status === 'completed');

            if (hasScheduled) {
                day.classList.add('scheduled');
            }
            if (hasCompleted && !hasScheduled) {
                day.classList.add('completed');
            }

            // Add click handler to show work details
            day.style.cursor = 'pointer';
            day.addEventListener('click', () => showWorkDetails(dateStr, dayWork));
        }

        calendarGrid.appendChild(day);
    }

    // Add next month's leading days
    const totalCells = calendarGrid.children.length - 7; // Subtract day headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarGrid.appendChild(day);
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Show work details for a selected date
function showWorkDetails(dateStr, dayWork) {
    const section = document.getElementById('work-details-section');
    const content = document.getElementById('work-details-content');

    // Format date for display
    const date = new Date(dateStr + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Build HTML for work items
    let html = `<p style="color: #6b7280; margin-bottom: 1rem;"><strong>${formattedDate}</strong></p>`;

    dayWork.forEach(work => {
        html += `
            <div class="work-item ${work.status}">
                <div class="work-item-header">
                    <div class="work-item-title">${work.title}</div>
                    <span class="work-item-status ${work.status}">
                        ${work.status === 'completed' ? '✓ Completed' : '⏰ Scheduled'}
                    </span>
                </div>
                <div class="work-item-info">
                    ${work.time ? `<div><i class="fas fa-clock"></i> ${work.time}</div>` : ''}
                    ${work.location ? `<div><i class="fas fa-map-marker-alt"></i> ${work.location}</div>` : ''}
                </div>
                ${work.description ? `<div class="work-item-description">${work.description}</div>` : ''}
                <div class="work-item-actions">
                    <button class="btn-small btn-edit" onclick="editWork(${work.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteWork(${work.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ${work.status === 'scheduled' ? `
                        <button class="btn-small btn-mark-complete" onclick="markWorkComplete(${work.id})">
                            <i class="fas fa-check"></i> Mark Complete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    content.innerHTML = html;
    section.style.display = 'block';

    // Scroll to work details
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Edit work
function editWork(workId) {
    const workerId = sessionStorage.getItem('workerId');
    const storageKey = `workSchedules_${workerId}`;
    const workSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const work = workSchedules.find(w => w.id === workId);
    if (!work) return;

    // Populate form with existing data
    document.getElementById('work-title').value = work.title;
    document.getElementById('work-date').value = work.date;
    document.getElementById('work-time').value = work.time || '';
    document.getElementById('work-location').value = work.location || '';
    document.getElementById('work-description').value = work.description || '';
    document.getElementById('work-status').value = work.status;

    // Store the work ID for updating
    document.getElementById('add-work-form').dataset.editId = workId;

    // Open modal
    openAddWorkModal();
}

// Delete work
function deleteWork(workId) {
    if (!confirm('Are you sure you want to delete this work schedule?')) return;

    const workerId = sessionStorage.getItem('workerId');
    const storageKey = `workSchedules_${workerId}`;
    let workSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Remove the work
    workSchedules = workSchedules.filter(w => w.id !== workId);

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(workSchedules));

    // Reload calendar
    renderCalendar();

    // Hide work details section
    document.getElementById('work-details-section').style.display = 'none';

    alert('Work schedule deleted successfully!');
}

// Mark work as complete
async function markWorkComplete(workId) {
    const workerId = sessionStorage.getItem('workerId');
    const workerName = sessionStorage.getItem('workerName');
    const workerCategory = sessionStorage.getItem('workerCategory') || 'General';
    const storageKey = `workSchedules_${workerId}`;
    let workSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Find and update the work
    const work = workSchedules.find(w => w.id === workId);
    if (work) {
        work.status = 'completed';

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(workSchedules));

        // Create a job entry in the database
        try {
            const jobData = {
                title: work.title,
                description: work.description || 'Completed work from calendar',
                category: workerCategory,
                customerId: workerId, // Self-assigned work
                customerName: workerName,
                workerId: workerId,
                workerName: workerName,
                location: work.location || 'Not specified',
                budget: 0, // Self-assigned work has no budget
                duration: work.time || 'Not specified',
                status: 'completed',
                priority: 'medium',
                deadline: new Date(work.date)
            };

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                console.log('Job entry created successfully');
                // Reload jobs section to show the new completed job
                loadWorkerJobs();
            } else {
                console.error('Failed to create job entry');
            }
        } catch (error) {
            console.error('Error creating job entry:', error);
        }

        // Reload calendar
        renderCalendar();

        // Refresh work details
        const dateStr = work.date;
        const dayWork = workSchedules.filter(w => w.date === dateStr);
        showWorkDetails(dateStr, dayWork);

        alert('Work marked as complete and added to My Jobs!');
    }
}

// Modal functions
function openAddWorkModal() {
    const modal = document.getElementById('add-work-modal');
    modal.style.display = 'flex';

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('work-date').setAttribute('min', today);
}

function closeAddWorkModal() {
    const modal = document.getElementById('add-work-modal');
    modal.style.display = 'none';
    const form = document.getElementById('add-work-form');
    form.reset();
    delete form.dataset.editId; // Clear edit mode
}

// Handle add work form submission
document.getElementById('add-work-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const workTitle = document.getElementById('work-title').value;
    const workDate = document.getElementById('work-date').value;
    const workTime = document.getElementById('work-time').value;
    const workLocation = document.getElementById('work-location').value;
    const workDescription = document.getElementById('work-description').value;
    const workStatus = document.getElementById('work-status').value;

    // Get existing work schedules from localStorage
    const workerId = sessionStorage.getItem('workerId');
    const storageKey = `workSchedules_${workerId}`;
    let workSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const form = e.target;
    const editId = form.dataset.editId;

    if (editId) {
        // Update existing work
        const work = workSchedules.find(w => w.id === parseInt(editId));
        if (work) {
            work.title = workTitle;
            work.date = workDate;
            work.time = workTime;
            work.location = workLocation;
            work.description = workDescription;
            work.status = workStatus;
        }
        alert('Work schedule updated successfully!');
    } else {
        // Add new work
        const newWork = {
            id: Date.now(),
            title: workTitle,
            date: workDate,
            time: workTime,
            location: workLocation,
            description: workDescription,
            status: workStatus,
            createdAt: new Date().toISOString()
        };
        workSchedules.push(newWork);
        alert('Work schedule added successfully!');
    }

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(workSchedules));

    // Close modal
    closeAddWorkModal();

    // Reload calendar
    renderCalendar();
});

// Update loadScheduledDates to load from localStorage
function loadScheduledDates() {
    const workerId = sessionStorage.getItem('workerId');
    const storageKey = `workSchedules_${workerId}`;
    const workSchedules = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Extract dates from work schedules
    scheduledDates = workSchedules
        .filter(work => work.status === 'scheduled')
        .map(work => work.date);

    renderCalendar();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const addWorkModal = document.getElementById('add-work-modal');
    const editProfileModal = document.getElementById('edit-profile-modal');

    if (e.target === addWorkModal) {
        closeAddWorkModal();
    }
    if (e.target === editProfileModal) {
        closeEditProfileModal();
    }
});

// Profile editing functions
function editProfile() {
    const modal = document.getElementById('edit-profile-modal');

    // Populate form with current data from sessionStorage
    document.getElementById('edit-name').value = sessionStorage.getItem('workerName') || '';
    document.getElementById('edit-email').value = sessionStorage.getItem('workerEmail') || '';
    document.getElementById('edit-phone').value = sessionStorage.getItem('workerPhone') || '';
    document.getElementById('edit-location').value = sessionStorage.getItem('workerLocation') || '';
    document.getElementById('edit-hourly-rate').value = sessionStorage.getItem('workerHourlyRate') || '';
    document.getElementById('edit-skills').value = sessionStorage.getItem('workerSkills') || '';
    document.getElementById('edit-experience').value = sessionStorage.getItem('workerExperience') || '';

    modal.style.display = 'flex';
}

function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    modal.style.display = 'none';
}

// Handle edit profile form submission
document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const location = document.getElementById('edit-location').value;
    const hourlyRate = document.getElementById('edit-hourly-rate').value;
    const skills = document.getElementById('edit-skills').value;
    const experience = document.getElementById('edit-experience').value;

    const workerId = sessionStorage.getItem('workerId');

    try {
        // Update worker profile via API
        const response = await fetch(`/api/workers/${workerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                location,
                hourlyRate: parseFloat(hourlyRate),
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                experience: parseInt(experience) || 0
            })
        });

        if (response.ok) {
            const updatedWorker = await response.json();

            // Update sessionStorage
            sessionStorage.setItem('workerName', name);
            sessionStorage.setItem('workerEmail', email);
            sessionStorage.setItem('workerPhone', phone);
            sessionStorage.setItem('workerLocation', location);
            sessionStorage.setItem('workerHourlyRate', hourlyRate);
            sessionStorage.setItem('workerSkills', skills);
            sessionStorage.setItem('workerExperience', experience);

            // Update profile display
            document.getElementById('worker-name').textContent = name;
            document.getElementById('worker-category').textContent = sessionStorage.getItem('workerCategory') || 'Worker';
            document.getElementById('worker-email').textContent = email;
            document.getElementById('worker-phone').textContent = phone;
            document.getElementById('worker-location').textContent = location;
            document.getElementById('stat-rate').textContent = `₹${hourlyRate}`;

            // Close modal
            closeEditProfileModal();

            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile. Please try again.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred. Please try again.');
    }
});

// Load worker bids
async function loadWorkerBids() {
    try {
        const response = await fetch(`/api/bids/worker/${workerId}`);
        if (!response.ok) throw new Error('Failed to fetch bids');

        const bids = await response.json();

        displayBids(bids);

    } catch (error) {
        console.error('Error loading bids:', error);
        document.getElementById('bids-container').innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading bids. Please try again.</p>
            </div>
        `;
    }
}

// Display bids
function displayBids(bids) {
    const container = document.getElementById('bids-container');
    const noBids = document.getElementById('no-bids');

    if (bids.length === 0) {
        container.style.display = 'none';
        noBids.style.display = 'flex';
        return;
    }

    container.style.display = 'grid';
    noBids.style.display = 'none';

    container.innerHTML = bids.map(bid => createBidCard(bid)).join('');
}

// Create bid card HTML
function createBidCard(bid) {
    const statusColors = {
        pending: { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
        accepted: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
        rejected: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
        withdrawn: { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af' }
    };

    const status = statusColors[bid.status] || statusColors.pending;
    const job = bid.jobId || {};

    const createdDate = new Date(bid.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // Build navigate button — always show for accepted bids
    // Use precise GPS if available, otherwise fallback to text-based search
    let navigateBtn = '';
    if (bid.status === 'accepted') {
        const mapsUrl = (job.coordinates && job.coordinates.lat)
            ? `https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.lat},${job.coordinates.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((job.location || '') + ' India')}`;
        navigateBtn = `
            <div style="margin-top: 10px;">
                <a href="${mapsUrl}" target="_blank" style="padding: 8px 16px; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; color: white; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 8px; font-weight: 600; box-shadow: 0 2px 8px rgba(79,70,229,0.35);">
                    <i class="fas fa-directions"></i> Navigate to Customer
                </a>
                ${!(job.coordinates && job.coordinates.lat) ? '<small style="display:block;margin-top:4px;color:#6b7280;font-size:11px;"><i class="fas fa-info-circle"></i> Approximate location (no GPS pin)</small>' : ''}
            </div>`;
    }

    return `
        <div class="bid-card" style="border-left: 4px solid ${status.border}">
            <div class="bid-card-header">
                <div>
                    <h3 class="bid-job-title">${job.title || 'Job Title'}</h3>
                    <span class="bid-status" style="background: ${status.bg}; color: ${status.color}; border: 1px solid ${status.border}">
                        ${bid.status.toUpperCase()}
                    </span>
                </div>
                <div class="bid-amount-display">
                    <div class="amount-label">Your Bid</div>
                    <div class="amount-value">₹${bid.bidAmount.toLocaleString('en-IN')}</div>
                </div>
            </div>

            <div class="bid-card-details">
                <div class="bid-detail-item">
                    <i class="fas fa-user"></i>
                    <span>Customer: ${job.customerName || 'N/A'}</span>
                </div>
                <div class="bid-detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${job.location || 'N/A'}</span>
                </div>
                ${navigateBtn}
                <div class="bid-detail-item">
                    <i class="fas fa-clock"></i>
                    <span>Duration: ${bid.estimatedDuration}</span>
                </div>
                <div class="bid-detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>Available: ${bid.availability}</span>
                </div>
            </div>

            ${bid.status === 'pending' ? `
                <div class="bid-card-actions">
                    <button class="btn-edit-bid" onclick="editBid('${bid._id}')">
                        <i class="fas fa-edit"></i> Edit Bid
                    </button>
                    <button class="btn-withdraw-bid" onclick="withdrawBid('${bid._id}')">
                        <i class="fas fa-times"></i> Withdraw
                    </button>
                </div>
            ` : ''}

            <div class="bid-card-footer">
                <small><i class="fas fa-clock"></i> Submitted on ${createdDate}</small>
                ${bid.status === 'accepted' ? `
                    <a href="/browse-jobs" class="btn-view-job">
                        <i class="fas fa-eye"></i> View Job
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Withdraw bid
async function withdrawBid(bidId) {
    if (!confirm('Are you sure you want to withdraw this bid?')) {
        return;
    }

    try {
        const response = await fetch(`/api/bids/${bidId}/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Bid withdrawn successfully.');
            loadWorkerBids();
        } else {
            alert(data.message || 'Failed to withdraw bid. Please try again.');
        }
    } catch (error) {
        console.error('Error withdrawing bid:', error);
        alert('Error withdrawing bid. Please try again.');
    }
}

// Edit bid (redirect to apply page with bid data)
function editBid(bidId) {
    alert('Edit bid functionality coming soon! For now, you can withdraw and submit a new bid.');
}

// Bid filter functionality
document.querySelectorAll('.bid-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.bid-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const status = btn.dataset.status;
        filterBids(status);
    });
});

async function filterBids(status) {
    try {
        const response = await fetch(`/api/bids/worker/${workerId}`);
        if (!response.ok) throw new Error('Failed to fetch bids');

        const bids = await response.json();
        const filtered = status === 'all' ? bids : bids.filter(bid => bid.status === status);

        displayBids(filtered);
    } catch (error) {
        console.error('Error filtering bids:', error);
    }
}

// Initialize dashboard
loadWorkerProfile();
loadWorkerJobs();
loadScheduledDates();
loadWorkerBids();



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
    } catch(e) {
        console.error(e);
        alert('Error placing bid');
    }
}
