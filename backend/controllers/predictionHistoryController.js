const PredictionHistory = require('../models/PredictionHistory');

// @desc    Save prediction to history
// @route   POST /api/predictions
// @access  Admin only
exports.savePrediction = async (req, res) => {
  try {
    const prediction = await PredictionHistory.create(req.body);

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get prediction history
// @route   GET /api/predictions
// @access  Admin only
exports.getPredictionHistory = async (req, res) => {
  try {
    const { 
      predictionType, 
      modelId, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = {};
    
    if (predictionType) query.predictionType = predictionType;
    if (modelId) query.modelId = modelId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const predictions = await PredictionHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await PredictionHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: predictions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: predictions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single prediction
// @route   GET /api/predictions/:id
// @access  Admin only
exports.getPrediction = async (req, res) => {
  try {
    const prediction = await PredictionHistory.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update prediction with actual value
// @route   PUT /api/predictions/:id/validate
// @access  Admin only
exports.validatePrediction = async (req, res) => {
  try {
    const { actualValue } = req.body;

    const prediction = await PredictionHistory.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }

    prediction.actualValue = actualValue;
    
    // Calculate accuracy (simplified - adjust based on your needs)
    const predicted = Number(prediction.prediction);
    const actual = Number(actualValue);
    
    if (!isNaN(predicted) && !isNaN(actual) && actual !== 0) {
      const error = Math.abs(predicted - actual);
      const percentError = (error / actual) * 100;
      prediction.accuracy = Math.max(0, 100 - percentError);
      prediction.status = prediction.accuracy >= 80 ? 'accurate' : 'inaccurate';
    } else {
      prediction.status = 'validated';
    }

    await prediction.save();

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get prediction statistics
// @route   GET /api/predictions/stats
// @access  Admin only
exports.getPredictionStats = async (req, res) => {
  try {
    const { predictionType, modelId } = req.query;

    let matchQuery = {};
    if (predictionType) matchQuery.predictionType = predictionType;
    if (modelId) matchQuery.modelId = modelId;

    const stats = await PredictionHistory.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$predictionType',
          totalPredictions: { $sum: 1 },
          averageAccuracy: { $avg: '$accuracy' },
          averageConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    const byStatus = await PredictionHistory.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        byStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete old predictions
// @route   DELETE /api/predictions/cleanup
// @access  Admin only
exports.cleanupOldPredictions = async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await PredictionHistory.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} old predictions`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
