const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  validateRegistration,
  validateLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
