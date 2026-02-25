const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');

// Get all workers
router.get('/', async (req, res) => {
  try {
    const workers = await Worker.find().sort({ createdAt: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single worker
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Worker login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find worker by email
    const worker = await Worker.findOne({ email });
    if (!worker) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password using bcrypt
    const isValidPassword = await worker.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      worker: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        category: worker.category,
        location: worker.location,
        hourlyRate: worker.hourlyRate,
        rating: worker.rating,
        completedJobs: worker.completedJobs
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Worker registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, location, skills, experience, hourlyRate, availability } = req.body;

    // Validate required fields
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if worker already exists
    const existingWorker = await Worker.findOne({ email });
    if (existingWorker) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new worker (password will be hashed by pre-save hook)
    const worker = new Worker({
      name,
      email,
      password,
      phone,
      location,
      skills,
      experience,
      hourlyRate,
      availability
    });

    const newWorker = await worker.save();

    // Remove password from response
    const workerResponse = newWorker.toObject();
    delete workerResponse.password;

    res.status(201).json({
      message: 'Registration successful!',
      worker: workerResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Create worker (admin)
router.post('/', async (req, res) => {
  const worker = new Worker(req.body);
  try {
    const newWorker = await worker.save();
    res.status(201).json(newWorker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update worker
router.put('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete worker
router.delete('/:id', async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get worker statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Worker.countDocuments();
    const available = await Worker.countDocuments({ availability: 'available' });
    const verified = await Worker.countDocuments({ verified: true });
    res.json({ total, available, verified });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

