const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      user: req.user.id
    };

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user's feedbacks
// @route   GET /api/feedback/my
// @access  Private
exports.getMyFeedbacks = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const feedbacks = await Feedback.find(query)
      .populate('adminResponse.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email roomNumber collegeRegistrationNumber')
      .populate('adminResponse.respondedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // Check authorization
    if (feedback.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all feedbacks (Admin)
// @route   GET /api/feedback/admin/all
// @access  Admin only
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email roomNumber collegeRegistrationNumber studentType')
      .populate('adminResponse.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update feedback status
// @route   PUT /api/feedback/:id/status
// @access  Admin only
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;

    await feedback.save();

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Respond to feedback
// @route   POST /api/feedback/:id/respond
// @access  Admin only
exports.respondToFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.adminResponse = {
      message,
      respondedBy: req.user.id,
      respondedAt: Date.now()
    };

    feedback.status = 'acknowledged';

    await feedback.save();

    await feedback.populate('adminResponse.respondedBy', 'name email');

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/admin/stats
// @access  Admin only
exports.getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    
    const byStatus = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byCategory = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const averageRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalFeedback,
        byStatus,
        byCategory,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
