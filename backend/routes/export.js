const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  exportStudents,
  exportAttendance,
  exportOrders,
  exportFeedback,
  exportComprehensiveReport
} = require('../controllers/exportController');

router.route('/students')
  .get(protect, authorize('admin', 'superadmin'), exportStudents);

router.route('/attendance')
  .get(protect, authorize('admin', 'superadmin'), exportAttendance);

router.route('/orders')
  .get(protect, authorize('admin', 'superadmin'), exportOrders);

router.route('/feedback')
  .get(protect, authorize('admin', 'superadmin'), exportFeedback);

router.route('/comprehensive')
  .get(protect, authorize('admin', 'superadmin'), exportComprehensiveReport);

module.exports = router;
