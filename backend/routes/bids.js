const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Job = require('../models/Job');

// Get all bids for a job
router.get('/job/:jobId', async (req, res) => {
  try {
    const bids = await Bid.find({ jobId: req.params.jobId })
      .populate('workerId', 'name email phone skills experience rating')
      .sort({ bidAmount: 1 }); // Sort by lowest bid first
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all bids by a worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const bids = await Bid.find({ workerId: req.params.workerId })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single bid
router.get('/:id', async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('jobId')
      .populate('workerId', 'name email phone skills experience rating');
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a bid
router.post('/', async (req, res) => {
  try {
    const { jobId, workerId } = req.body;

    // Check if job exists and is open for bidding
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer accepting bids' });
    }
    if (!job.biddingEnabled) {
      return res.status(400).json({ message: 'Bidding is not enabled for this job' });
    }

    // Check if worker already submitted a bid
    const existingBid = await Bid.findOne({ jobId, workerId, status: 'pending' });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already submitted a bid for this job' });
    }

    // Validate bid amount against budget constraints
    if (job.maxBudget && req.body.bidAmount > job.maxBudget) {
      return res.status(400).json({ message: `Bid amount cannot exceed maximum budget of ₹${job.maxBudget}` });
    }
    if (job.minBudget && req.body.bidAmount < job.minBudget) {
      return res.status(400).json({ message: `Bid amount must be at least ₹${job.minBudget}` });
    }

    // Create new bid
    const bid = new Bid(req.body);
    const newBid = await bid.save();

    // Update job's total bids count
    job.totalBids = (job.totalBids || 0) + 1;
    await job.save();

    res.status(201).json(newBid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update bid (for worker to edit their bid)
router.put('/:id', async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Only allow updating pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update a bid that has been accepted or rejected' });
    }

    // Check if job is still open
    const job = await Job.findById(bid.jobId);
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is no longer accepting bids' });
    }

    // Validate new bid amount
    if (req.body.bidAmount) {
      if (job.maxBudget && req.body.bidAmount > job.maxBudget) {
        return res.status(400).json({ message: `Bid amount cannot exceed maximum budget of ₹${job.maxBudget}` });
      }
      if (job.minBudget && req.body.bidAmount < job.minBudget) {
        return res.status(400).json({ message: `Bid amount must be at least ₹${job.minBudget}` });
      }
    }

    req.body.updatedAt = Date.now();
    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept a bid (for customer)
router.post('/:id/accept', async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'This bid has already been processed' });
    }

    const job = await Job.findById(bid.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Accept the bid
    bid.status = 'accepted';
    bid.updatedAt = Date.now();
    await bid.save();

    // Update job with accepted bid details
    job.workerId = bid.workerId;
    job.workerName = bid.workerName;
    job.status = 'assigned';
    job.acceptedBidId = bid._id;
    job.finalPrice = bid.bidAmount;
    job.updatedAt = Date.now();
    await job.save();

    // Reject all other pending bids for this job
    await Bid.updateMany(
      { jobId: bid.jobId, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected', updatedAt: Date.now() }
    );

    res.json({ message: 'Bid accepted successfully', bid, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject a bid (for customer)
router.post('/:id/reject', async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'This bid has already been processed' });
    }

    bid.status = 'rejected';
    bid.updatedAt = Date.now();
    await bid.save();

    res.json({ message: 'Bid rejected successfully', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Withdraw a bid (for worker)
router.post('/:id/withdraw', async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw a bid that has been accepted or rejected' });
    }

    bid.status = 'withdrawn';
    bid.updatedAt = Date.now();
    await bid.save();

    // Decrease job's total bids count
    const job = await Job.findById(bid.jobId);
    if (job) {
      job.totalBids = Math.max(0, (job.totalBids || 1) - 1);
      await job.save();
    }

    res.json({ message: 'Bid withdrawn successfully', bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete bid
router.delete('/:id', async (req, res) => {
  try {
    const bid = await Bid.findByIdAndDelete(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });
    res.json({ message: 'Bid deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

