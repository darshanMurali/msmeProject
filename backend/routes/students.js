const express = require('express');
const {
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, authorize('admin', 'superadmin'), getAllStudents);

router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, updateStudent)
  .delete(protect, authorize('superadmin'), deleteStudent);

router.route('/:id/stats').get(protect, getStudentStats);

module.exports = router;
