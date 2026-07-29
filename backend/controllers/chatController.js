const Chat = require('../models/Chat');

// @desc    Get or create chat
// @route   GET /api/chat
// @access  Private
exports.getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find admin user
    const User = require('../models/User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Find existing chat between user and admin
    let chat = await Chat.findOne({
      participants: { $all: [userId, admin._id] }
    }).populate('participants', 'name email role photo');

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        participants: [userId, admin._id]
      });
      await chat.populate('participants', 'name email role photo');
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Verify user is participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Add message
    chat.messages.push({
      sender: req.user.id,
      content,
      attachments: attachments || []
    });

    await chat.save();
    await chat.populate('participants', 'name email role photo');
    await chat.populate('messages.sender', 'name photo');

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'name photo');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Verify user is participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Paginate messages
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (Number(page) * Number(limit)));
    const endIndex = totalMessages - ((Number(page) - 1) * Number(limit));
    const messages = chat.messages.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: messages.length,
      total: totalMessages,
      page: Number(page),
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Mark all messages not sent by current user as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id) {
        message.isRead = true;
      }
    });

    await chat.save();

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all chats (Admin)
// @route   GET /api/chat/admin/all
// @access  Admin only
exports.getAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const chats = await Chat.find({ isActive: true })
      .populate('participants', 'name email role photo studentType roomNumber')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Chat.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: chats.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: chats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    });

    let unreadCount = 0;
    chats.forEach(chat => {
      chat.messages.forEach(message => {
        if (message.sender.toString() !== req.user.id && !message.isRead) {
          unreadCount++;
        }
      });
    });

    res.status(200).json({ success: true, data: { unreadCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
