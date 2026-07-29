const express = require('express');
const {
  markAttendance,
  getAllAttendance,
  getAttendanceByStudent,
  getAttendanceStats,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('student'), markAttendance)
  .get(protect, authorize('admin', 'superadmin'), getAllAttendance);

router.route('/stats').get(protect, authorize('admin', 'superadmin'), getAttendanceStats);

router
  .route('/student/:id?')
  .get(protect, getAttendanceByStudent);

router
  .route('/:id')
  .delete(protect, authorize('admin', 'superadmin'), deleteAttendance);

module.exports = router;
