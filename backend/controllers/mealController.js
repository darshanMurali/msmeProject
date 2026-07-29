const MealFeedback = require('../models/MealFeedback');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Submit meal feedback
// @route   POST /api/meals/feedback
// @access  Private (Student)
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { mealType, rating, comment, taste, quantity, quality } = req.body;

  // Check if feedback already submitted for this meal today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingFeedback = await MealFeedback.findOne({
    student: req.user.id,
    date: { $gte: today },
    mealType
  });

  if (existingFeedback) {
    return next(new ErrorResponse(`Feedback already submitted for ${mealType} today`, 400));
  }

  const feedback = await MealFeedback.create({
    student: req.user.id,
    mealType,
    rating,
    comment,
    taste,
    quantity,
    quality
  });

  res.status(201).json({
    success: true,
    data: feedback
  });
});

// @desc    Get all meal feedback
// @route   GET /api/meals/feedback
// @access  Private (Admin)
exports.getAllFeedback = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  let query = {};
  if (req.query.mealType) {
    query.mealType = req.query.mealType;
  }
  if (req.query.date) {
    const date = new Date(req.query.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    query.date = { $gte: date, $lt: nextDay };
  }

  const total = await MealFeedback.countDocuments(query);
  const feedback = await MealFeedback.find(query)
    .populate('student', 'name email roomNumber')
    .sort('-date')
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: feedback.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: feedback
  });
});

// @desc    Get feedback by student
// @route   GET /api/meals/feedback/student/:id
// @access  Private
exports.getFeedbackByStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.params.id || req.user.id;

  // Check if user is authorized
  if (req.user.role !== 'admin' && req.user.id !== studentId) {
    return next(new ErrorResponse('Not authorized to access this data', 403));
  }

  const feedback = await MealFeedback.find({ student: studentId })
    .sort('-date')
    .limit(30);

  res.status(200).json({
    success: true,
    count: feedback.length,
    data: feedback
  });
});

// @desc    Get feedback statistics
// @route   GET /api/meals/feedback/stats
// @access  Private (Admin)
exports.getFeedbackStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's feedback summary
  const todayFeedback = await MealFeedback.aggregate([
    {
      $match: {
        date: { $gte: today }
      }
    },
    {
      $group: {
        _id: '$mealType',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
        averageTaste: { $avg: '$taste' },
        averageQuantity: { $avg: '$quantity' },
        averageQuality: { $avg: '$quality' }
      }
    }
  ]);

  // Weekly trends
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyTrends = await MealFeedback.aggregate([
    {
      $match: {
        date: { $gte: weekAgo }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          mealType: '$mealType'
        },
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      todayFeedback,
      weeklyTrends
    }
  });
});

// @desc    Get meal schedule
// @route   GET /api/meals/schedule
// @access  Private
exports.getMealSchedule = asyncHandler(async (req, res, next) => {
  // This is a static schedule, but you can make it dynamic from database
  const schedule = {
    Monday: {
      breakfast: 'Idli, Sambar, Chutney',
      lunch: 'Rice, Dal, Vegetable Curry, Chapati',
      dinner: 'Rice, Sambar, Rasam, Vegetable Fry'
    },
    Tuesday: {
      breakfast: 'Poha, Tea',
      lunch: 'Rice, Rajma, Mixed Veg, Chapati',
      dinner: 'Rice, Dal Fry, Cabbage Sabzi, Chapati'
    },
    Wednesday: {
      breakfast: 'Upma, Coffee',
      lunch: 'Rice, Chole, Aloo Gobi, Chapati',
      dinner: 'Rice, Kadhi, Bhindi Masala, Chapati'
    },
    Thursday: {
      breakfast: 'Paratha, Curd',
      lunch: 'Rice, Dal Tadka, Paneer Curry, Chapati',
      dinner: 'Rice, Tomato Dal, Cauliflower Fry, Chapati'
    },
    Friday: {
      breakfast: 'Dosa, Chutney, Sambar',
      lunch: 'Rice, Rajma, Baingan Bharta, Chapati',
      dinner: 'Rice, Dal, Mixed Vegetable, Chapati'
    },
    Saturday: {
      breakfast: 'Puri, Potato Curry',
      lunch: 'Rice, Chole, Paneer Butter Masala, Chapati',
      dinner: 'Rice, Dal Makhani, Jeera Aloo, Chapati'
    },
    Sunday: {
      breakfast: 'Aloo Paratha, Curd',
      lunch: 'Biryani, Raita, Papad',
      dinner: 'Rice, Dal, Special Curry, Chapati'
    }
  };

  res.status(200).json({
    success: true,
    data: schedule
  });
});
