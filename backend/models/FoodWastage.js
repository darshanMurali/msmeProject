const mongoose = require('mongoose');

const foodWastageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  },
  foodPrepared: {
    type: Number,
    required: [true, 'Please add amount of food prepared (in kg)']
  },
  foodConsumed: {
    type: Number,
    required: [true, 'Please add amount of food consumed (in kg)']
  },
  wastage: {
    type: Number,
    required: true
  },
  studentsPresent: {
    type: Number,
    required: true
  },
  averageFeedbackScore: {
    type: Number,
    min: 0,
    max: 5
  },
  prediction: {
    type: Number
  },
  weather: {
    type: String,
    enum: ['sunny', 'rainy', 'cloudy', 'other']
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate wastage before saving
foodWastageSchema.pre('save', function(next) {
  if (this.foodPrepared && this.foodConsumed) {
    this.wastage = this.foodPrepared - this.foodConsumed;
  }
  
  // Set day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  this.dayOfWeek = days[this.date.getDay()];
  
  next();
});

// Create index for faster queries
foodWastageSchema.index({ date: -1, mealType: 1 });

module.exports = mongoose.model('FoodWastage', foodWastageSchema);
