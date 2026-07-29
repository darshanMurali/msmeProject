const express = require('express');
const {
  createFoodWastage,
  getAllFoodWastage,
  getFoodWastageStats,
  predictFoodWastage,
  updateFoodWastage,
  deleteFoodWastage,
  uploadTrainingData,
  getTrainingStats
} = require('../controllers/foodWastageController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'superadmin'), createFoodWastage)
  .get(protect, authorize('admin', 'superadmin'), getAllFoodWastage);

router
  .route('/stats')
  .get(protect, authorize('admin', 'superadmin'), getFoodWastageStats);

router
  .route('/training-stats')
  .get(protect, authorize('admin', 'superadmin'), getTrainingStats);

router
  .route('/upload-csv')
  .post(protect, authorize('admin', 'superadmin'), upload.single('file'), uploadTrainingData);

router
  .route('/predict')
  .post(protect, authorize('admin', 'superadmin'), predictFoodWastage);

router
  .route('/:id')
  .put(protect, authorize('admin', 'superadmin'), updateFoodWastage)
  .delete(protect, authorize('admin', 'superadmin'), deleteFoodWastage);

module.exports = router;
