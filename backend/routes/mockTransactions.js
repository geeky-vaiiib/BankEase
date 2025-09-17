const express = require('express');
const mockDB = require('../mockDatabase');
const { mockAuth } = require('./mockAuth');
const router = express.Router();

// Get balance
router.get('/balance', mockAuth, async (req, res) => {
  try {
    const user = await mockDB.findUserById(req.user._id);
    
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

// Send money
router.post('/send', mockAuth, async (req, res) => {
  try {
    const { to, amount } = req.body;
    const senderId = req.user._id;

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

    const sender = await mockDB.findUserById(senderId);
    if (sender.balance < amountNum) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const recipient = await mockDB.findUserByPhone(to.trim());
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found. Please check the phone number.'
      });
    }

    if (sender._id === recipient._id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send money to yourself'
      });
    }

    // Update balances
    await mockDB.updateUserBalance(sender._id, sender.balance - amountNum);
    await mockDB.updateUserBalance(recipient._id, recipient.balance + amountNum);

    // Create transaction records
    const senderTransaction = await mockDB.createTransaction({
      userId: sender._id,
      type: 'send',
      amount: amountNum,
      to: recipient.phone,
      description: `Sent to ${recipient.name}`
    });

    await mockDB.createTransaction({
      userId: recipient._id,
      type: 'receive',
      amount: amountNum,
      from: sender.phone,
      description: `Received from ${sender.name}`
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
        newBalance: sender.balance - amountNum,
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

// Get recent transactions
router.get('/recent', mockAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await mockDB.getTransactionsByUserId(userId, 5);

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

// Get transaction history
router.get('/history', mockAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const allTransactions = await mockDB.getTransactionsByUserId(userId, 100);
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const transactions = allTransactions.slice(startIndex, startIndex + parseInt(limit));

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
        transactions: formattedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allTransactions.length / parseInt(limit)),
          totalTransactions: allTransactions.length,
          hasNextPage: startIndex + parseInt(limit) < allTransactions.length,
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

module.exports = router;
