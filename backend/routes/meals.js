const express = require('express');
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByStudent,
  getFeedbackStats,
  getMealSchedule
} = require('../controllers/mealController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/feedback')
  .post(protect, authorize('student'), submitFeedback)
  .get(protect, authorize('admin', 'superadmin'), getAllFeedback);

router.route('/feedback/stats').get(protect, authorize('admin', 'superadmin'), getFeedbackStats);

router.route('/feedback/student/:id?').get(protect, getFeedbackByStudent);

router.route('/schedule').get(protect, getMealSchedule);

module.exports = router;
