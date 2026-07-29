const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  savePrediction,
  getPredictionHistory,
  getPrediction,
  validatePrediction,
  getPredictionStats,
  cleanupOldPredictions
} = require('../controllers/predictionHistoryController');

router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getPredictionHistory)
  .post(protect, authorize('admin', 'superadmin'), savePrediction);

router.route('/stats')
  .get(protect, authorize('admin', 'superadmin'), getPredictionStats);

router.route('/cleanup')
  .delete(protect, authorize('admin', 'superadmin'), cleanupOldPredictions);

router.route('/:id')
  .get(protect, authorize('admin', 'superadmin'), getPrediction);

router.route('/:id/validate')
  .put(protect, authorize('admin', 'superadmin'), validatePrediction);

module.exports = router;
