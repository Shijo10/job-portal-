// Skills management
let skills = [];

function addSkill() {
    const skillInput = document.getElementById('skill-input');
    const skill = skillInput.value.trim();
    
    if (skill && !skills.includes(skill)) {
        skills.push(skill);
        updateSkillsDisplay();
        skillInput.value = '';
        document.getElementById('skills').value = JSON.stringify(skills);
    }
}

function removeSkill(skill) {
    skills = skills.filter(s => s !== skill);
    updateSkillsDisplay();
    document.getElementById('skills').value = JSON.stringify(skills);
}

function updateSkillsDisplay() {
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    
    skills.forEach(skill => {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.innerHTML = `
            <span>${skill}</span>
            <button type="button" onclick="removeSkill('${skill}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        skillsList.appendChild(tag);
    });
}

// Allow adding skill with Enter key
document.addEventListener('DOMContentLoaded', () => {
    const skillInput = document.getElementById('skill-input');
    skillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
});

// Password toggle function
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');

    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Real-time email validation
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    const validationDiv = document.getElementById('email-validation');

    if (email) {
        const result = validateEmail(email);
        if (result.valid) {
            this.classList.remove('invalid');
            this.classList.add('valid');
            validationDiv.textContent = '✓ Valid email';
            validationDiv.className = 'validation-message success';
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
            validationDiv.textContent = result.message;
            validationDiv.className = 'validation-message error';
        }
    }
});

// Real-time password validation
document.getElementById('password').addEventListener('blur', function() {
    const password = this.value;
    const validationDiv = document.getElementById('password-validation');

    if (password) {
        const result = validatePassword(password);
        if (result.valid) {
            this.classList.remove('invalid');
            this.classList.add('valid');
            validationDiv.textContent = `✓ ${result.strength.charAt(0).toUpperCase() + result.strength.slice(1)} password`;
            validationDiv.className = 'validation-message success';
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
            validationDiv.textContent = result.errors[0];
            validationDiv.className = 'validation-message error';
        }
    }
});

// Confirm password validation
document.getElementById('confirm-password').addEventListener('blur', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const validationDiv = document.getElementById('confirm-password-validation');

    if (confirmPassword) {
        if (password === confirmPassword) {
            this.classList.remove('invalid');
            this.classList.add('valid');
            validationDiv.textContent = '✓ Passwords match';
            validationDiv.className = 'validation-message success';
        } else {
            this.classList.remove('valid');
            this.classList.add('invalid');
            validationDiv.textContent = 'Passwords do not match';
            validationDiv.className = 'validation-message error';
        }
    }
});

// Form submission
const registerForm = document.getElementById('register-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const submitBtn = document.getElementById('submit-btn');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate skills
    if (skills.length === 0) {
        errorText.textContent = 'Please add at least one skill';
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
        return;
    }

    // Validate email
    const email = document.getElementById('email').value.trim();
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
        errorText.textContent = emailResult.message;
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 3000);
        return;
    }

    // Validate password
    const password = document.getElementById('password').value;
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
        errorText.textContent = passwordResult.errors[0];
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 3000);
        return;
    }

    // Validate password match
    const confirmPassword = document.getElementById('confirm-password').value;
    if (password !== confirmPassword) {
        errorText.textContent = 'Passwords do not match';
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 3000);
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    // Collect form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: email,
        password: password,
        phone: document.getElementById('phone').value.trim(),
        location: document.getElementById('location').value.trim(),
        experience: parseInt(document.getElementById('experience').value),
        hourlyRate: parseFloat(document.getElementById('hourlyRate').value),
        skills: skills,
        availability: document.getElementById('availability').value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/workers/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            successMessage.classList.add('show');
            registerForm.reset();
            skills = [];
            updateSkillsDisplay();
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            // Show error message
            errorText.textContent = data.message || 'Registration failed. Please try again.';
            errorMessage.classList.add('show');
            setTimeout(() => {
                errorMessage.classList.remove('show');
            }, 3000);
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Create Account</span><i class="fas fa-arrow-right"></i>';
        }
    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = 'Network error. Please check your connection and try again.';
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span><i class="fas fa-arrow-right"></i>';
    }
});

