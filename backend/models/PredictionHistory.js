const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    index: true
  },
  modelName: {
    type: String,
    required: true
  },
  predictionType: {
    type: String,
    enum: ['food_wastage', 'attendance', 'demand', 'other'],
    required: true,
    index: true
  },
  inputData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  prediction: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  actualValue: {
    type: mongoose.Schema.Types.Mixed
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100
  },
  metadata: {
    executionTime: Number,
    dataPoints: Number,
    features: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'validated', 'accurate', 'inaccurate'],
    default: 'pending'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound indexes
predictionHistorySchema.index({ predictionType: 1, createdAt: -1 });
predictionHistorySchema.index({ modelId: 1, createdAt: -1 });

module.exports = mongoose.model('PredictionHistory', predictionHistorySchema);
