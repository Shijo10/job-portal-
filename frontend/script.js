const API_URL = '/api';
let currentSection = 'dashboard';
let editingId = null;
let editingType = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadDashboard();
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(section) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        workers: 'Workers Management',
        customers: 'Customers Management',
        jobs: 'Jobs Management'
    };
    document.getElementById('page-title').textContent = titles[section];

    currentSection = section;

    // Load data
    if (section === 'dashboard') loadDashboard();
    else if (section === 'workers') loadWorkers();
    else if (section === 'customers') loadCustomers();
    else if (section === 'jobs') loadJobs();
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        const stats = await response.json();

        document.getElementById('total-workers').textContent = stats.totalWorkers;
        document.getElementById('total-customers').textContent = stats.totalCustomers;
        document.getElementById('total-jobs').textContent = stats.totalJobs;
        document.getElementById('completed-jobs').textContent = stats.completedJobs;

        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentActivity() {
    try {
        const [jobs, workers, customers] = await Promise.all([
            fetch(`${API_URL}/jobs`).then(r => r.json()),
            fetch(`${API_URL}/workers`).then(r => r.json()),
            fetch(`${API_URL}/customers`).then(r => r.json())
        ]);

        const activityDiv = document.getElementById('recent-activity');
        let html = '<div class="activity-list">';

        // Show recent jobs
        jobs.slice(0, 5).forEach(job => {
            html += `
                <div class="activity-item">
                    <i class="fas fa-briefcase"></i>
                    <span>New job posted: <strong>₹{job.title}</strong> by ${job.customerName}</span>
                    <span class="activity-time">₹{formatDate(job.createdAt)}</span>
                </div>
            `;
        });

        html += '</div>';
        activityDiv.innerHTML = html;
    } catch (error) {
        console.error('Error loading recent activity:', error);
        document.getElementById('recent-activity').innerHTML = '<p class="loading">Failed to load activity</p>';
    }
}

// Workers
async function loadWorkers() {
    try {
        const response = await fetch(`${API_URL}/workers`);
        const workers = await response.json();

        const tbody = document.getElementById('workers-table-body');
        if (workers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">No workers found</td></tr>';
            return;
        }

        tbody.innerHTML = workers.map(worker => `
            <tr>
                <td>₹{worker.name}</td>
                <td>₹{worker.email}</td>
                <td>₹{worker.phone}</td>
                <td>₹{worker.skills.join(', ') || 'N/A'}</td>
                <td>₹{worker.location}</td>
                <td>₹${worker.hourlyRate}</td>
                <td><span class="badge badge-${getAvailabilityClass(worker.availability)}">₹{worker.availability}</span></td>
                <td>⭐ ${worker.rating.toFixed(1)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editWorker('${worker._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteWorker('${worker._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading workers:', error);
        document.getElementById('workers-table-body').innerHTML =
            '<tr><td colspan="9" class="loading">Error loading workers</td></tr>';
    }
}

// Customers
async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`);
        const customers = await response.json();

        const tbody = document.getElementById('customers-table-body');
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">No customers found</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>₹{customer.name}</td>
                <td>₹{customer.email}</td>
                <td>₹{customer.phone}</td>
                <td>₹{customer.location}</td>
                <td>₹{customer.company || 'N/A'}</td>
                <td>₹{customer.postedJobs}</td>
                <td><span class="badge badge-${customer.verified ? 'success' : 'warning'}">₹{customer.verified ? 'Yes' : 'No'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editCustomer('${customer._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteCustomer('${customer._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Jobs
async function loadJobs() {
    try {
        const response = await fetch(`${API_URL}/jobs`);
        const jobs = await response.json();

        const tbody = document.getElementById('jobs-table-body');
        if (jobs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">No jobs found</td></tr>';
            return;
        }

        tbody.innerHTML = jobs.map(job => `
            <tr>
                <td>₹{job.title}</td>
                <td>₹{job.customerName}</td>
                <td>₹{job.workerName || 'Unassigned'}</td>
                <td>₹{job.category}</td>
                <td>₹{job.location}</td>
                <td>₹${job.budget}</td>
                <td><span class="badge badge-${getStatusClass(job.status)}">₹{job.status}</span></td>
                <td><span class="badge badge-${getPriorityClass(job.priority)}">₹{job.priority}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editJob('${job._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteJob('${job._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading jobs:', error);
    }
}

// Modal Functions
function openAddModal(type) {
    editingId = null;
    editingType = type;
    document.getElementById('modal-title').textContent = `Add ${capitalize(type)}`;

    const formFields = document.getElementById('form-fields');
    formFields.innerHTML = getFormFields(type);

    document.getElementById('modal').classList.add('active');
}

async function editWorker(id) {
    try {
        const response = await fetch(`${API_URL}/workers/${id}`);
        const worker = await response.json();

        editingId = id;
        editingType = 'worker';
        document.getElementById('modal-title').textContent = 'Edit Worker';

        const formFields = document.getElementById('form-fields');
        formFields.innerHTML = getFormFields('worker', worker);

        document.getElementById('modal').classList.add('active');
    } catch (error) {
        console.error('Error loading worker:', error);
        alert('Failed to load worker data');
    }
}

async function editCustomer(id) {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`);
        const customer = await response.json();

        editingId = id;
        editingType = 'customer';
        document.getElementById('modal-title').textContent = 'Edit Customer';

        const formFields = document.getElementById('form-fields');
        formFields.innerHTML = getFormFields('customer', customer);

        document.getElementById('modal').classList.add('active');
    } catch (error) {
        console.error('Error loading customer:', error);
        alert('Failed to load customer data');
    }
}

async function editJob(id) {
    try {
        const response = await fetch(`${API_URL}/jobs/${id}`);
        const job = await response.json();

        editingId = id;
        editingType = 'job';
        document.getElementById('modal-title').textContent = 'Edit Job';

        const formFields = document.getElementById('form-fields');
        formFields.innerHTML = await getFormFields('job', job);

        document.getElementById('modal').classList.add('active');
    } catch (error) {
        console.error('Error loading job:', error);
        alert('Failed to load job data');
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    editingId = null;
    editingType = null;
}

// Form Fields Generator
function getFormFields(type, data = {}) {
    if (type === 'worker') {
        return `
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${data.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" value="${data.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" value="${data.phone || ''}" required>
            </div>
            <div class="form-group">
                <label>Skills (comma separated)</label>
                <input type="text" name="skills" value="${data.skills ? data.skills.join(', ') : ''}">
            </div>
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" value="${data.location || ''}" required>
            </div>
            <div class="form-group">
                <label>Hourly Rate (₹)</label>
                <input type="number" name="hourlyRate" value="${data.hourlyRate || 0}" min="0">
            </div>
            <div class="form-group">
                <label>Experience (years)</label>
                <input type="number" name="experience" value="${data.experience || 0}" min="0">
            </div>
            <div class="form-group">
                <label>Availability</label>
                <select name="availability">
                    <option value="available" ${data.availability === 'available' ? 'selected' : ''}>Available</option>
                    <option value="busy" ${data.availability === 'busy' ? 'selected' : ''}>Busy</option>
                    <option value="unavailable" ${data.availability === 'unavailable' ? 'selected' : ''}>Unavailable</option>
                </select>
            </div>
        `;
    } else if (type === 'customer') {
        return `
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${data.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" value="${data.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" name="phone" value="${data.phone || ''}" required>
            </div>
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" value="${data.location || ''}" required>
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" name="company" value="${data.company || ''}">
            </div>
        `;
    } else if (type === 'job') {
        return `
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" value="${data.title || ''}" required>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" required>₹{data.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Category *</label>
                <input type="text" name="category" value="${data.category || ''}" required>
            </div>
            <div class="form-group">
                <label>Customer ID *</label>
                <input type="text" name="customerId" value="${data.customerId || ''}" required>
            </div>
            <div class="form-group">
                <label>Customer Name *</label>
                <input type="text" name="customerName" value="${data.customerName || ''}" required>
            </div>
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" value="${data.location || ''}" required>
            </div>
            <div class="form-group">
                <label>Budget (₹) *</label>
                <input type="number" name="budget" value="${data.budget || 0}" min="0" required>
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" name="duration" value="${data.duration || ''}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="open" ${data.status === 'open' ? 'selected' : ''}>Open</option>
                    <option value="assigned" ${data.status === 'assigned' ? 'selected' : ''}>Assigned</option>
                    <option value="in-progress" ${data.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${data.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${data.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select name="priority">
                    <option value="low" ${data.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${data.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${data.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="urgent" ${data.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                </select>
            </div>
        `;
    }
}


// Form Submit Handler
document.getElementById('modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'skills') {
            data[key] = value.split(',').map(s => s.trim()).filter(s => s);
        } else if (key === 'hourlyRate' || key === 'experience' || key === 'budget') {
            data[key] = parseFloat(value) || 0;
        } else {
            data[key] = value;
        }
    }

    try {
        let url = `${API_URL}/${editingType}s`;
        let method = 'POST';

        if (editingId) {
            url += `/${editingId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            refreshData();
            alert(`${capitalize(editingType)} ${editingId ? 'updated' : 'created'} successfully!`);
        } else {
            const error = await response.json();
            alert(`Error: ₹{error.message}`);
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Failed to save data');
    }
});

// Delete Functions
async function deleteWorker(id) {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    try {
        const response = await fetch(`${API_URL}/workers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadWorkers();
            alert('Worker deleted successfully!');
        } else {
            alert('Failed to delete worker');
        }
    } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
    }
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
        const response = await fetch(`${API_URL}/customers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadCustomers();
            alert('Customer deleted successfully!');
        } else {
            alert('Failed to delete customer');
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
    }
}

async function deleteJob(id) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadJobs();
            alert('Job deleted successfully!');
        } else {
            alert('Failed to delete job');
        }
    } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job');
    }
}

// Utility Functions
function refreshData() {
    if (currentSection === 'dashboard') loadDashboard();
    else if (currentSection === 'workers') loadWorkers();
    else if (currentSection === 'customers') loadCustomers();
    else if (currentSection === 'jobs') loadJobs();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

function getAvailabilityClass(availability) {
    const classes = {
        'available': 'success',
        'busy': 'warning',
        'unavailable': 'danger'
    };
    return classes[availability] || 'info';
}

function getStatusClass(status) {
    const classes = {
        'open': 'info',
        'assigned': 'primary',
        'in-progress': 'warning',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return classes[status] || 'info';
}

function getPriorityClass(priority) {
    const classes = {
        'low': 'info',
        'medium': 'primary',
        'high': 'warning',
        'urgent': 'danger'
    };
    return classes[priority] || 'info';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}
