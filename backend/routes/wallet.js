const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getWallet,
  topUpWallet,
  getTransactions,
  getAllWallets,
  adjustWalletBalance
} = require('../controllers/walletController');

router.route('/')
  .get(protect, getWallet);

router.route('/topup')
  .post(protect, topUpWallet);

router.route('/transactions')
  .get(protect, getTransactions);

router.route('/admin/all')
  .get(protect, authorize('admin', 'superadmin'), getAllWallets);

router.route('/:userId/adjust')
  .post(protect, authorize('admin', 'superadmin'), adjustWalletBalance);

module.exports = router;
