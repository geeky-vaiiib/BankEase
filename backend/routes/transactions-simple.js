const express = require('express');
const jwt = require('jsonwebtoken');
const mockDB = require('../mockDB');
const router = express.Router();

// Simple auth middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await mockDB.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. User not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Access denied. Invalid token.' 
    });
  }
};

// @route   GET /api/transactions/balance
// @desc    Get user's current balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = req.user;
    
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
  try {
    const { to, amount } = req.body;
    const sender = req.user;

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

    // Check if sender has sufficient balance
    if (sender.balance < amountNum) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Find recipient by phone number
    const recipient = await mockDB.findUserByPhone(to.trim());
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found. Please check the phone number.'
      });
    }

    // Check if trying to send to self
    if (sender._id === recipient._id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send money to yourself'
      });
    }

    // Update balances
    const newSenderBalance = sender.balance - amountNum;
    const newRecipientBalance = recipient.balance + amountNum;

    await mockDB.updateUserBalance(sender._id, newSenderBalance);
    await mockDB.updateUserBalance(recipient._id, newRecipientBalance);

    // Create transaction records
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    const senderTransaction = await mockDB.createTransaction({
      userId: sender._id,
      type: 'send',
      amount: amountNum,
      to: recipient.phone,
      description: `Sent to ${recipient.name}`,
      transactionId
    });

    await mockDB.createTransaction({
      userId: recipient._id,
      type: 'receive',
      amount: amountNum,
      from: sender.phone,
      description: `Received from ${sender.name}`,
      transactionId
    });

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
        newBalance: newSenderBalance,
        timestamp: senderTransaction.createdAt
      }
    });

  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during money transfer'
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
    const transactions = await mockDB.findTransactionsByUserId(userId, 5);

    // Format transactions for response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id,
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: transaction.amount,
      to: transaction.to,
      from: transaction.from,
      description: transaction.description,
      status: transaction.status || 'completed',
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

module.exports = router;
