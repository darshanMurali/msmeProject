const Wallet = require('../models/Wallet');

// @desc    Get user's wallet
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/topup
// @access  Private
exports.topUpWallet = async (req, res) => {
  try {
    const { amount, paymentMethod = 'online' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = new Wallet({ user: req.user.id });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Wallet top-up via ${paymentMethod}`,
      referenceType: 'topup',
      balanceAfter: wallet.balance
    });

    await wallet.save();

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    let transactions = wallet.transactions;

    // Filter by type if provided
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sort by timestamp descending
    transactions.sort((a, b) => b.timestamp - a.timestamp);

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedTransactions.length,
      total: transactions.length,
      page: Number(page),
      pages: Math.ceil(transactions.length / Number(limit)),
      data: paginatedTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all wallets (Admin)
// @route   GET /api/wallet/admin/all
// @access  Admin only
exports.getAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const wallets = await Wallet.find()
      .populate('user', 'name email roomNumber')
      .sort({ balance: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Wallet.countDocuments();

    res.status(200).json({
      success: true,
      count: wallets.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: wallets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust wallet balance (Admin)
// @route   POST /api/wallet/:userId/adjust
// @access  Admin only
exports.adjustWalletBalance = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount === 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ user: req.params.userId });

    if (!wallet) {
      wallet = new Wallet({ user: req.params.userId });
    }

    const type = amount > 0 ? 'credit' : 'debit';
    wallet.balance += amount;

    wallet.transactions.push({
      type,
      amount: Math.abs(amount),
      description: reason || 'Admin adjustment',
      referenceType: 'adjustment',
      balanceAfter: wallet.balance
    });

    await wallet.save();

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
