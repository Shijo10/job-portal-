const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Admin = require('../models/Admin');

// In-memory OTP storage: email -> { otp, expires, userType }
const otpStorage = new Map();

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    let user = null;
    let userType = '';

    // Check which model the email belongs to
    user = await Customer.findOne({ email: email.toLowerCase() });
    if(user) userType = 'customer';
    else {
      user = await Worker.findOne({ email: email.toLowerCase() });
      if(user) userType = 'worker';
      else {
         user = await Admin.findOne({ email: email.toLowerCase() });
         if (user) userType = 'admin';
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User with this email not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStorage.set(email.toLowerCase(), { otp, expires, userType });

    console.log(`[AUTH] OTP requested for ${email}: ${otp}`);

    console.log(`[AUTH] Local OTP generated for ${email}: ${otp}`);

    res.json({ 
      message: 'OTP generated successfully.',
      otp: otp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Verify OTP
    const storedData = otpStorage.get(email.toLowerCase());
    
    if (!storedData) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    if (Date.now() > storedData.expires) {
      otpStorage.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // The schemas should use a pre-save hook to hash password. 
    // We fetch the user and update the password.
    let user;
    if (storedData.userType === 'customer') {
       user = await Customer.findOne({ email: email.toLowerCase() });
    } else if (storedData.userType === 'worker') {
       user = await Worker.findOne({ email: email.toLowerCase() });
    } else if (storedData.userType === 'admin') {
       user = await Admin.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Clear OTP
    otpStorage.delete(email.toLowerCase());

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
