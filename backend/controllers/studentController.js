const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { exportToExcel, formatUserDataForExport } = require('../utils/excelExport');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
exports.getAllStudents = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const query = { role: 'student' };

  // Filter by student type
  if (req.query.studentType) {
    query.studentType = req.query.studentType;
  }

  // Filter by department
  if (req.query.department) {
    query.department = req.query.department;
  }

  // Filter by year
  if (req.query.year) {
    query.year = parseInt(req.query.year);
  }

  // Filter by active status
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true';
  }

  // Search by name, email, registration number, or room number
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { collegeRegistrationNumber: { $regex: req.query.search, $options: 'i' } },
      { roomNumber: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(query);
  const students = await User.find(query)
    .select('-password')
    .sort('name')
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: students
  });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.params.id).select('-password');

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Check if user is authorized (admin or the student themselves)
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new ErrorResponse('Not authorized to access this data', 403));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin or Student themselves)
exports.updateStudent = asyncHandler(async (req, res, next) => {
  let student = await User.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new ErrorResponse('Not authorized to update this student', 403));
  }

  // Students cannot change their own role
  if (req.user.role !== 'admin' && req.body.role) {
    delete req.body.role;
  }

  // Don't allow password update through this route
  if (req.body.password) {
    delete req.body.password;
  }

  student = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Super Admin only)
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  // Only super admin can delete students
  if (req.user.role !== 'superadmin') {
    return next(new ErrorResponse('Not authorized to delete this student', 403));
  }

  const student = await User.findByIdAndDelete(req.params.id);

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get student dashboard stats
// @route   GET /api/students/:id/stats
// @access  Private
exports.getStudentStats = asyncHandler(async (req, res, next) => {
  const studentId = req.params.id || req.user.id;

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== studentId) {
    return next(new ErrorResponse('Not authorized to access this data', 403));
  }

  const Attendance = require('../models/Attendance');
  const MealFeedback = require('../models/MealFeedback');
  const LeaveRequest = require('../models/LeaveRequest');

  // Get attendance statistics
  const totalDays = 30; // Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attendanceCount = await Attendance.countDocuments({
    student: studentId,
    date: { $gte: thirtyDaysAgo }
  });

  const attendancePercentage = ((attendanceCount / totalDays) * 100).toFixed(2);

  // Get meal feedback count
  const feedbackCount = await MealFeedback.countDocuments({
    student: studentId,
    date: { $gte: thirtyDaysAgo }
  });

  // Get leave requests
  const leaveRequests = await LeaveRequest.find({
    student: studentId
  }).sort('-createdAt').limit(5);

  const pendingLeaves = await LeaveRequest.countDocuments({
    student: studentId,
    status: 'pending'
  });

  res.status(200).json({
    success: true,
    data: {
      attendanceCount,
      attendancePercentage,
      feedbackCount,
      leaveRequests,
      pendingLeaves
    }
  });
});
