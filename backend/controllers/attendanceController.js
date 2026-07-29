const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Student)
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { method, location } = req.body;
  
  // Check if attendance already marked today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingAttendance = await Attendance.findOne({
    student: req.user.id,
    date: { $gte: today }
  });

  if (existingAttendance) {
    return next(new ErrorResponse('Attendance already marked for today', 400));
  }

  const attendance = await Attendance.create({
    student: req.user.id,
    time: new Date().toLocaleTimeString(),
    method: method || 'qr',
    location: location || 'Hostel Gate',
    status: 'present'
  });

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin)
exports.getAllAttendance = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const query = {};
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  // Filter by student type
  if (req.query.studentType) {
    const students = await User.find({ studentType: req.query.studentType }).select('_id');
    query.student = { $in: students.map(s => s._id) };
  }
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by meal type
  if (req.query.mealType) {
    query.mealType = req.query.mealType;
  }

  const total = await Attendance.countDocuments(query);
  const attendance = await Attendance.find(query)
    .populate('student', 'name email roomNumber collegeRegistrationNumber studentType department')
    .sort('-date')
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: attendance.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: attendance
  });
});

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:id
// @access  Private
exports.getAttendanceByStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.params.id || req.user.id;

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== studentId) {
    return next(new ErrorResponse('Not authorized to access this data', 403));
  }

  const attendance = await Attendance.find({ student: studentId })
    .sort('-date')
    .limit(30);

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Admin)
exports.getAttendanceStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's attendance
  const todayAttendance = await Attendance.countDocuments({
    date: { $gte: today }
  });

  // Total students
  const totalStudents = await User.countDocuments({ role: 'student' });

  // Weekly attendance
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyAttendance = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: weekAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      todayAttendance,
      totalStudents,
      attendancePercentage: ((todayAttendance / totalStudents) * 100).toFixed(2),
      weeklyAttendance
    }
  });
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse('Attendance record not found', 404));
  }

  await attendance.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
