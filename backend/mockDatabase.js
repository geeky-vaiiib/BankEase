// Simple in-memory data store for testing without MongoDB
class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
  }

  // User operations
  async createUser(userData) {
    const userId = this.userIdCounter++;
    const user = {
      _id: userId.toString(),
      ...userData,
      balance: 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(userId.toString(), user);
    return user;
  }

  async findUserByPhone(phone) {
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id) || null;
  }

  async updateUserBalance(id, newBalance) {
    const user = this.users.get(id);
    if (user) {
      user.balance = newBalance;
      user.updatedAt = new Date();
      return user;
    }
    return null;
  }

  // Transaction operations
  async createTransaction(transactionData) {
    const transactionId = 'TXN' + Date.now() + this.transactionIdCounter++;
    const transaction = {
      _id: this.transactionIdCounter.toString(),
      ...transactionData,
      transactionId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(transaction._id, transaction);
    return transaction;
  }

  async getTransactionsByUserId(userId, limit = 10) {
    const userTransactions = Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
    return userTransactions;
  }
}

module.exports = new InMemoryStore();
