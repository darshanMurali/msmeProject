const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const { 
  exportToExcel, 
  formatUserDataForExport, 
  formatAttendanceDataForExport,
  formatOrderDataForExport,
  formatFeedbackDataForExport,
  exportMultipleSheets
} = require('../utils/excelExport');

// @desc    Export students to Excel
// @route   GET /api/export/students
// @access  Admin only
exports.exportStudents = async (req, res) => {
  try {
    const { studentType, department, year, isActive } = req.query;
    
    let query = { role: 'student' };
    
    if (studentType) query.studentType = studentType;
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const students = await User.find(query).select('-password').lean();
    
    const formattedData = formatUserDataForExport(students);
    const buffer = exportToExcel(formattedData, 'Students');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export attendance to Excel
// @route   GET /api/export/attendance
// @access  Admin only
exports.exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (mealType) {
      query.mealType = mealType;
    }
    
    const attendance = await Attendance.find(query)
      .populate('student', 'name collegeRegistrationNumber roomNumber')
      .lean();
    
    const formattedData = formatAttendanceDataForExport(attendance);
    const buffer = exportToExcel(formattedData, 'Attendance');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export orders to Excel
// @route   GET /api/export/orders
// @access  Admin only
exports.exportOrders = async (req, res) => {
  try {
    const { startDate, endDate, orderStatus, paymentStatus } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const orders = await Order.find(query)
      .populate('user', 'name collegeRegistrationNumber')
      .lean();
    
    const formattedData = formatOrderDataForExport(orders);
    const buffer = exportToExcel(formattedData, 'Orders');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export feedback to Excel
// @route   GET /api/export/feedback
// @access  Admin only
exports.exportFeedback = async (req, res) => {
  try {
    const { category, status, startDate, endDate } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const feedbacks = await Feedback.find(query)
      .populate('user', 'name')
      .lean();
    
    const formattedData = formatFeedbackDataForExport(feedbacks);
    const buffer = exportToExcel(formattedData, 'Feedback');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=feedback_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export comprehensive report with multiple sheets
// @route   GET /api/export/comprehensive
// @access  Admin only
exports.exportComprehensiveReport = async (req, res) => {
  try {
    // Get students
    const students = await User.find({ role: 'student' }).select('-password').lean();
    const formattedStudents = formatUserDataForExport(students);
    
    // Get recent attendance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendance = await Attendance.find({ 
      date: { $gte: thirtyDaysAgo } 
    }).populate('student', 'name collegeRegistrationNumber roomNumber').lean();
    const formattedAttendance = formatAttendanceDataForExport(attendance);
    
    // Get recent orders (last 30 days)
    const orders = await Order.find({ 
      createdAt: { $gte: thirtyDaysAgo } 
    }).populate('user', 'name collegeRegistrationNumber').lean();
    const formattedOrders = formatOrderDataForExport(orders);
    
    // Get recent feedback (last 30 days)
    const feedbacks = await Feedback.find({ 
      createdAt: { $gte: thirtyDaysAgo } 
    }).populate('user', 'name').lean();
    const formattedFeedback = formatFeedbackDataForExport(feedbacks);
    
    // Create multi-sheet workbook
    const sheets = [
      { name: 'Students', data: formattedStudents },
      { name: 'Attendance', data: formattedAttendance },
      { name: 'Orders', data: formattedOrders },
      { name: 'Feedback', data: formattedFeedback }
    ];
    
    const buffer = exportMultipleSheets(sheets);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=hostelease_report_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
