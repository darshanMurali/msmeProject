const express = require('express');
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestsByStudent,
  getLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('student'), createLeaveRequest)
  .get(protect, authorize('admin', 'superadmin'), getAllLeaveRequests);

router.route('/student/:id?').get(protect, getLeaveRequestsByStudent);

router
  .route('/:id')
  .get(protect, getLeaveRequest)
  .put(protect, authorize('admin', 'superadmin'), updateLeaveRequest)
  .delete(protect, deleteLeaveRequest);

module.exports = router;
