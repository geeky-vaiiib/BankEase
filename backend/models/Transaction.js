const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['send', 'receive', 'pay'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  to: {
    type: String,
    required: function() {
      return this.type === 'send' || this.type === 'pay';
    },
    trim: true
  },
  from: {
    type: String,
    required: function() {
      return this.type === 'receive';
    },
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description must be less than 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Generate unique transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  next();
});

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
// transactionId index is already created by unique: true

module.exports = mongoose.model('Transaction', transactionSchema);
