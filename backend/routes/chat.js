const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOrCreateChat,
  sendMessage,
  getMessages,
  markAsRead,
  getAllChats,
  getUnreadCount
} = require('../controllers/chatController');

router.route('/')
  .get(protect, getOrCreateChat);

router.route('/admin/all')
  .get(protect, authorize('admin', 'superadmin'), getAllChats);

router.route('/unread')
  .get(protect, getUnreadCount);

router.route('/:chatId/messages')
  .get(protect, getMessages)
  .post(protect, sendMessage);

router.route('/:chatId/read')
  .put(protect, markAsRead);

module.exports = router;
