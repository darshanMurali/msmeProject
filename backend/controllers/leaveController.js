const LeaveRequest = require('../models/LeaveRequest');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create leave request
// @route   POST /api/leave
// @access  Private (Student)
exports.createLeaveRequest = asyncHandler(async (req, res, next) => {
  const { fromDate, toDate, reason } = req.body;

  // Validate dates
  if (new Date(fromDate) > new Date(toDate)) {
    return next(new ErrorResponse('From date cannot be after to date', 400));
  }

  const leaveRequest = await LeaveRequest.create({
    student: req.user.id,
    fromDate,
    toDate,
    reason
  });

  res.status(201).json({
    success: true,
    data: leaveRequest
  });
});

// @desc    Get all leave requests
// @route   GET /api/leave
// @access  Private (Admin)
exports.getAllLeaveRequests = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  let query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await LeaveRequest.countDocuments(query);
  const leaveRequests = await LeaveRequest.find(query)
    .populate('student', 'name email roomNumber phone')
    .populate('approvedBy', 'name')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: leaveRequests.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: leaveRequests
  });
});

// @desc    Get leave requests by student
// @route   GET /api/leave/student/:id
// @access  Private
exports.getLeaveRequestsByStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.params.id || req.user.id;

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== studentId) {
    return next(new ErrorResponse('Not authorized to access this data', 403));
  }

  const leaveRequests = await LeaveRequest.find({ student: studentId })
    .populate('approvedBy', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: leaveRequests.length,
    data: leaveRequests
  });
});

// @desc    Get single leave request
// @route   GET /api/leave/:id
// @access  Private
exports.getLeaveRequest = asyncHandler(async (req, res, next) => {
  const leaveRequest = await LeaveRequest.findById(req.params.id)
    .populate('student', 'name email roomNumber phone')
    .populate('approvedBy', 'name');

  if (!leaveRequest) {
    return next(new ErrorResponse('Leave request not found', 404));
  }

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== leaveRequest.student._id.toString()) {
    return next(new ErrorResponse('Not authorized to access this data', 403));
  }

  res.status(200).json({
    success: true,
    data: leaveRequest
  });
});

// @desc    Update leave request status
// @route   PUT /api/leave/:id
// @access  Private (Admin)
exports.updateLeaveRequest = asyncHandler(async (req, res, next) => {
  let leaveRequest = await LeaveRequest.findById(req.params.id);

  if (!leaveRequest) {
    return next(new ErrorResponse('Leave request not found', 404));
  }

  const { status, adminComment } = req.body;

  leaveRequest = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminComment,
      approvedBy: req.user.id,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: leaveRequest
  });
});

// @desc    Delete leave request
// @route   DELETE /api/leave/:id
// @access  Private (Student - own, Admin - all)
exports.deleteLeaveRequest = asyncHandler(async (req, res, next) => {
  const leaveRequest = await LeaveRequest.findById(req.params.id);

  if (!leaveRequest) {
    return next(new ErrorResponse('Leave request not found', 404));
  }

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== leaveRequest.student.toString()) {
    return next(new ErrorResponse('Not authorized to delete this leave request', 403));
  }

  await leaveRequest.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
