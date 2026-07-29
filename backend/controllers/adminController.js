const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private (Super Admin)
exports.getAllAdmins = asyncHandler(async (req, res, next) => {
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
  res.status(200).json({
    success: true,
    count: admins.length,
    data: admins
  });
});

// @desc    Get single admin
// @route   GET /api/admins/:id
// @access  Private (Super Admin)
exports.getAdmin = asyncHandler(async (req, res, next) => {
  const admin = await User.findById(req.params.id).select('-password');

  if (!admin) {
    return next(new ErrorResponse('Admin not found', 404));
  }

  if (admin.role !== 'admin' && admin.role !== 'superadmin') {
    return next(new ErrorResponse('User is not an admin', 400));
  }

  res.status(200).json({
    success: true,
    data: admin
  });
});

// @desc    Create admin
// @route   POST /api/admins
// @access  Private (Super Admin)
exports.createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already in use', 400));
  }

  const admin = await User.create({
    name,
    email,
    password,
    phone,
    role: 'admin'
  });

  // Remove password from response
  const adminWithoutPassword = admin.toObject();
  delete adminWithoutPassword.password;

  res.status(201).json({
    success: true,
    data: adminWithoutPassword
  });
});

// @desc    Update admin
// @route   PUT /api/admins/:id
// @access  Private (Super Admin)
exports.updateAdmin = asyncHandler(async (req, res, next) => {
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return next(new ErrorResponse('Admin not found', 404));
  }

  if (admin.role !== 'admin' && admin.role !== 'superadmin') {
    return next(new ErrorResponse('User is not an admin', 400));
  }

  // Prevent changing role of superadmin or self
  if (req.body.role) {
    if (admin.role === 'superadmin') {
      return next(new ErrorResponse('Cannot change role of super admin', 403));
    }
    if (req.user.id === req.params.id && req.body.role !== 'superadmin') {
      return next(new ErrorResponse('Cannot change your own role', 403));
    }
    // Only allow setting to 'admin' or 'superadmin'
    if (!['admin', 'superadmin'].includes(req.body.role)) {
      return next(new ErrorResponse('Invalid role', 400));
    }
  }

  // Don't allow updating password here
  if (req.body.password) {
    delete req.body.password;
  }

  const updatedAdmin = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: updatedAdmin
  });
});

// @desc    Delete admin
// @route   DELETE /api/admins/:id
// @access  Private (Super Admin)
exports.deleteAdmin = asyncHandler(async (req, res, next) => {
  const admin = await User.findById(req.params.id);

  if (!admin) {
    return next(new ErrorResponse('Admin not found', 404));
  }

  if (admin.role !== 'admin' && admin.role !== 'superadmin') {
    return next(new ErrorResponse('User is not an admin', 400));
  }

  // Prevent deleting superadmin or self
  if (admin.role === 'superadmin') {
    return next(new ErrorResponse('Cannot delete super admin', 403));
  }

  if (req.user.id === req.params.id) {
    return next(new ErrorResponse('Cannot delete your own account', 403));
  }

  await admin.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
