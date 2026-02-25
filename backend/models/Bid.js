const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  workerName: {
    type: String,
    required: true
  },
  workerEmail: {
    type: String,
    required: true
  },
  workerPhone: {
    type: String,
    required: true
  },
  workerExperience: {
    type: Number,
    default: 0
  },
  workerRating: {
    type: Number,
    default: 0
  },
  bidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    required: true,
    minlength: 50
  },
  availability: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
bidSchema.index({ jobId: 1, workerId: 1 });
bidSchema.index({ jobId: 1, status: 1 });
bidSchema.index({ workerId: 1, status: 1 });

module.exports = mongoose.model('Bid', bidSchema);

