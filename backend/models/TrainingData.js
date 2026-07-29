const mongoose = require('mongoose');

const trainingDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  studentsPresent: {
    type: Number,
    required: true
  },
  foodPrepared: {
    type: Number,
    required: true
  },
  foodConsumed: {
    type: Number,
    required: true
  },
  wastage: {
    type: Number,
    required: true
  },
  weather: {
    type: String,
    enum: ['sunny', 'rainy', 'cloudy', 'other'],
    default: 'sunny'
  },
  dayOfWeek: {
    type: String,
    required: true
  },
  averageFeedbackScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 3.5
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
trainingDataSchema.index({ date: -1 });
trainingDataSchema.index({ mealType: 1 });
trainingDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TrainingData', trainingDataSchema);
