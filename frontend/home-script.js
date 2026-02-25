// Check if user is logged in and update navbar
function updateNavbarForLoggedInUser() {
    const workerId = sessionStorage.getItem('workerId');
    const customerId = sessionStorage.getItem('customerId');
    const navButtons = document.querySelector('.nav-buttons');

    if (workerId) {
        // Worker is logged in
        const workerName = sessionStorage.getItem('workerName');
        navButtons.innerHTML = `
            <a href="/worker-dashboard" class="btn-primary-nav" style="text-decoration: none;">
                <i class="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <button class="btn-secondary-nav" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    } else if (customerId) {
        // Customer is logged in
        const customerName = sessionStorage.getItem('customerName');
        navButtons.innerHTML = `
            <a href="/post-job" class="btn-primary-nav" style="text-decoration: none;">
                <i class="fas fa-briefcase"></i> Post Job
            </a>
            <a href="/my-jobs" class="btn-secondary-nav" style="text-decoration: none;">
                <i class="fas fa-list"></i> My Jobs
            </a>
            <button class="btn-secondary-nav" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
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

// Call on page load
updateNavbarForLoggedInUser();

// Login dropdown functionality
const loginBtn = document.getElementById('login-btn');
const loginMenu = document.getElementById('login-menu');

if (loginBtn && loginMenu) {
    loginBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        loginMenu.classList.toggle('show');
        // Close signup menu if open
        if (signupMenu) signupMenu.classList.remove('show');
    });
}

// Signup dropdown functionality
const signupBtn = document.getElementById('signup-btn');
const signupMenu = document.getElementById('signup-menu');

if (signupBtn && signupMenu) {
    signupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        signupMenu.classList.toggle('show');
        // Close login menu if open
        if (loginMenu) loginMenu.classList.remove('show');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (signupBtn && signupMenu && !signupBtn.contains(e.target) && !signupMenu.contains(e.target)) {
        signupMenu.classList.remove('show');
    }
    if (loginBtn && loginMenu && !loginBtn.contains(e.target) && !loginMenu.contains(e.target)) {
        loginMenu.classList.remove('show');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.about-card, .step-card, .info-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Counter animation for stats
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 30);
};

// Trigger counter animation when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statItems = entry.target.querySelectorAll('.stat-item h3');
            statItems.forEach((item, index) => {
                const values = [500, 1000, 2500];
                setTimeout(() => {
                    animateCounter(item, values[index]);
                }, index * 200);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

