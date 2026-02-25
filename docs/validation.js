// Email Validation
function validateEmail(email) {
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email || email.trim() === '') {
        return {
            valid: false,
            message: 'Email is required'
        };
    }
    
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: 'Please enter a valid email address'
        };
    }
    
    // Check for common typos in popular domains
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = email.split('@')[1];
    
    if (domain && domain.includes('..')) {
        return {
            valid: false,
            message: 'Email contains invalid characters'
        };
    }
    
    return {
        valid: true,
        message: 'Email is valid'
    };
}

// Password Validation
function validatePassword(password) {
    const errors = [];
    
    if (!password || password.trim() === '') {
        return {
            valid: false,
            message: 'Password is required',
            errors: ['Password is required']
        };
    }
    
    // Minimum length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    // Maximum length check
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }
    
    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
    if (weakPasswords.includes(password.toLowerCase())) {
        errors.push('This password is too common. Please choose a stronger password');
    }
    
    if (errors.length > 0) {
        return {
            valid: false,
            message: errors[0],
            errors: errors
        };
    }
    
    return {
        valid: true,
        message: 'Password is strong',
        strength: calculatePasswordStrength(password)
    };
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// Phone Number Validation (Indian format)
function validatePhone(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check for Indian phone number format
    // Should be 10 digits or 12 digits with country code (91)
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    
    if (!phone || phone.trim() === '') {
        return {
            valid: false,
            message: 'Phone number is required'
        };
    }
    
    if (!phoneRegex.test(cleaned)) {
        return {
            valid: false,
            message: 'Please enter a valid Indian phone number (10 digits starting with 6-9)'
        };
    }
    
    return {
        valid: true,
        message: 'Phone number is valid',
        formatted: formatPhoneNumber(cleaned)
    };
}

// Format phone number
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    return phone;
}

