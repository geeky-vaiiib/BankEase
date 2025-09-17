const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/transactions/balance
// @desc    Get user's current balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        balance: user.balance,
        userId: user._id,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching balance'
    });
  }
});

// @route   POST /api/transactions/send
// @desc    Send money to another user
// @access  Private
router.post('/send', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { to, amount } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient phone number and amount'
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount greater than 0'
      });
    }

    if (amountNum < 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Minimum transfer amount is $0.01'
      });
    }

    // Find sender
    const sender = await User.findById(senderId).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    // Check if sender has sufficient balance
    if (sender.balance < amountNum) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Find recipient by phone number
    const recipient = await User.findOne({ phone: to.trim() }).session(session);
    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Recipient not found. Please check the phone number.'
      });
    }

    // Check if trying to send to self
    if (sender._id.equals(recipient._id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot send money to yourself'
      });
    }

    // Update balances
    sender.balance -= amountNum;
    recipient.balance += amountNum;

    await sender.save({ session });
    await recipient.save({ session });

    // Create transaction records
    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'send',
      amount: amountNum,
      to: recipient.phone,
      description: `Sent to ${recipient.name}`
    });

    const recipientTransaction = new Transaction({
      userId: recipient._id,
      type: 'receive',
      amount: amountNum,
      from: sender.phone,
      description: `Received from ${sender.name}`
    });

    await senderTransaction.save({ session });
    await recipientTransaction.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Money sent successfully',
      data: {
        transactionId: senderTransaction.transactionId,
        amount: amountNum,
        recipient: {
          name: recipient.name,
          phone: recipient.phone
        },
        newBalance: sender.balance,
        timestamp: senderTransaction.createdAt
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Send money error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during money transfer'
    });
  } finally {
    session.endSession();
  }
});

// @route   GET /api/transactions/history
// @desc    Get user's transaction history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments({ userId });
    const totalPages = Math.ceil(totalTransactions / parseInt(limit));

    // Format transactions for response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id,
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: transaction.amount,
      to: transaction.to,
      from: transaction.from,
      description: transaction.description,
      status: transaction.status,
      date: transaction.createdAt,
      timestamp: transaction.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction history'
    });
  }
});

// @route   GET /api/transactions/recent
// @desc    Get user's last 5 transactions
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get last 5 transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format transactions for response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id,
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: transaction.amount,
      to: transaction.to,
      from: transaction.from,
      description: transaction.description,
      status: transaction.status,
      date: transaction.createdAt,
      timestamp: transaction.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions
      }
    });

  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent transactions'
    });
  }
});

// @route   GET /api/transactions/:transactionId
// @desc    Get specific transaction details
// @access  Private
router.get('/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    const transaction = await Transaction.findOne({ 
      transactionId, 
      userId 
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction._id,
          transactionId: transaction.transactionId,
          type: transaction.type,
          amount: transaction.amount,
          to: transaction.to,
          from: transaction.from,
          description: transaction.description,
          status: transaction.status,
          date: transaction.createdAt,
          timestamp: transaction.createdAt.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Transaction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction details'
    });
  }
});

module.exports = router;
