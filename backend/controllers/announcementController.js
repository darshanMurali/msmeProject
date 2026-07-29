const Announcement = require('../models/Announcement');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin)
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, message, priority, targetAudience, expiryDate } = req.body;

  const announcement = await Announcement.create({
    admin: req.user.id,
    title,
    message,
    priority,
    targetAudience,
    expiryDate
  });

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAllAnnouncements = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Filter out expired announcements
  const query = {
    isActive: true,
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gte: new Date() } }
    ]
  };

  const total = await Announcement.countDocuments(query);
  const announcements = await Announcement.find(query)
    .populate('admin', 'name')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: announcements.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: announcements
  });
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('admin', 'name email');

  if (!announcement) {
    return next(new ErrorResponse('Announcement not found', 404));
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin)
exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse('Announcement not found', 404));
  }

  // Check if user is the creator or admin
  if (announcement.admin.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this announcement', 403));
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Super Admin only)
exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse('Announcement not found', 404));
  }

  // Only super admin can delete announcements
  if (req.user.role !== 'superadmin') {
    return next(new ErrorResponse('Not authorized to delete this announcement', 403));
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Toggle announcement status
// @route   PATCH /api/announcements/:id/toggle
// @access  Private (Admin)
exports.toggleAnnouncementStatus = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse('Announcement not found', 404));
  }

  announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    { isActive: !announcement.isActive },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: announcement
  });
});
