// Simple in-memory database for demonstration
class MockDB {
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.transactionCounter = 1;
  }

  // User operations
  async createUser(userData) {
    const user = {
      _id: this.generateId(),
      ...userData,
      balance: userData.balance || 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.phone, user);
    return user;
  }

  async findUserByPhone(phone) {
    return this.users.get(phone) || null;
  }

  async findUserById(id) {
    for (const user of this.users.values()) {
      if (user._id === id) return user;
    }
    return null;
  }

  async updateUserBalance(userId, newBalance) {
    for (const [phone, user] of this.users.entries()) {
      if (user._id === userId) {
        user.balance = newBalance;
        user.updatedAt = new Date();
        this.users.set(phone, user);
        return user;
      }
    }
    return null;
  }

  // Transaction operations
  async createTransaction(transactionData) {
    const transaction = {
      _id: this.generateId(),
      ...transactionData,
      transactionId: transactionData.transactionId || `TXN${Date.now()}${this.transactionCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(transaction._id, transaction);
    return transaction;
  }

  async findTransactionsByUserId(userId, limit = 10) {
    const userTransactions = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.userId === userId) {
        userTransactions.push(transaction);
      }
    }
    return userTransactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

module.exports = new MockDB();
