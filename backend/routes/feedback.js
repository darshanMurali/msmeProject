const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitFeedback,
  getMyFeedbacks,
  getFeedback,
  getAllFeedbacks,
  updateFeedbackStatus,
  respondToFeedback,
  getFeedbackStats
} = require('../controllers/feedbackController');

router.route('/')
  .post(protect, submitFeedback);

router.route('/my')
  .get(protect, getMyFeedbacks);

router.route('/admin/all')
  .get(protect, authorize('admin', 'superadmin'), getAllFeedbacks);

router.route('/admin/stats')
  .get(protect, authorize('admin', 'superadmin'), getFeedbackStats);

router.route('/:id')
  .get(protect, getFeedback);

router.route('/:id/status')
  .put(protect, authorize('admin', 'superadmin'), updateFeedbackStatus);

router.route('/:id/respond')
  .post(protect, authorize('admin', 'superadmin'), respondToFeedback);

module.exports = router;
