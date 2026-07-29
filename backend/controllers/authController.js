const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { body, validationResult } = require('express-validator');

/**
 * ADMIN CREDENTIALS (Single Admin System)
 * Email: admin123@gmail.com
 * Password: @admin123
 * 
 * Note: Only ONE admin is allowed in the system.
 * Admin registration is disabled. Students can register normally.
 */

// Validation middleware for registration
exports.validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .notEmpty()
    .withMessage('Please provide a phone number'),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'superadmin'])
    .withMessage('Role must be either student, admin or superadmin'),
  body('studentType')
    .optional()
    .isIn(['hosteller', 'day_scholar'])
    .withMessage('Student type must be either hosteller or day_scholar'),
  body('collegeRegistrationNumber')
    .optional()
    .notEmpty()
    .withMessage('College registration number is required'),
  body('roomNumber')
    .optional()
    .notEmpty()
    .withMessage('Room number is required'),
  body('parentContact')
    .optional()
    .notEmpty()
    .withMessage('Please provide parent contact number')
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const {
    name,
    email,
    password,
    role,
    roomNumber,
    phone,
    parentContact,
    studentType,
    collegeRegistrationNumber,
    department,
    year
  } = req.body;

  // Prevent admin registration - only one admin exists
  if (role === 'admin') {
    return next(new ErrorResponse('Admin registration is not allowed', 403));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('This email is already registered. Please use a different email or login.', 400));
  }

  // Validate required fields
  if (!name || !email || !password || !phone) {
    return next(new ErrorResponse('Please provide all required fields: name, email, password, and phone', 400));
  }

  // Create user data object - force role to be 'student'
  const userData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: 'student',
    phone: phone.trim(),
    studentType: studentType || 'hosteller',
    collegeRegistrationNumber: collegeRegistrationNumber || `REG${Date.now()}`,
    parentContact: parentContact || phone
  };

  // Add optional fields
  if (roomNumber) userData.roomNumber = roomNumber.trim();
  if (department) userData.department = department.trim();
  if (year) userData.year = year;

  try {
    // Create user
    const user = await User.create(userData);
    sendTokenResponse(user, 200, res);
  } catch (dbError) {
    // Handle database validation errors
    if (dbError.code === 11000) {
      return next(new ErrorResponse('This email or registration number is already in use', 400));
    }
    if (dbError.name === 'ValidationError') {
      const message = Object.values(dbError.errors).map(err => err.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    return next(new ErrorResponse('Registration failed. Please check your information and try again.', 500));
  }
});

// Validation middleware for login
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  // Hardcoded admin credentials for backward compatibility
  const ADMIN_EMAIL = 'admin123@gmail.com';
  const ADMIN_PASSWORD = '@admin123';

  const SUPERADMIN_EMAIL = 'superadmin@gmail.com';
  const SUPERADMIN_PASSWORD = '@superadmin123';

  // First check if user exists in database
  let user = await User.findOne({ email }).select('+password');

  // If user doesn't exist, check if it's one of the default accounts
  if (!user) {
    // Super Admin first time login
    if (email === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD) {
      user = await User.create({
        name: 'Super Admin',
        email: SUPERADMIN_EMAIL,
        password: SUPERADMIN_PASSWORD,
        role: 'superadmin',
        phone: '9999999999'
      });
      return sendTokenResponse(user, 200, res);
    }

    // Admin first time login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      user = await User.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        phone: '0000000000'
      });
      return sendTokenResponse(user, 200, res);
    }

    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    // Check if it's the default password for backward compatibility
    if (
      (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) ||
      (email === SUPERADMIN_EMAIL && password === SUPERADMIN_PASSWORD)
    ) {
      // Update user's password to the new hashed one
      user.password = password;
      await user.save();
      return sendTokenResponse(user, 200, res);
    }
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      role: user.role,
      id: user._id
    });
};
