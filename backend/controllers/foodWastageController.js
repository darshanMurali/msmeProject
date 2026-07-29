const FoodWastage = require('../models/FoodWastage');
const MealFeedback = require('../models/MealFeedback');
const Attendance = require('../models/Attendance');
const TrainingData = require('../models/TrainingData');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const axios = require('axios');
const geminiService = require('../services/geminiService');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

// @desc    Create food wastage record
// @route   POST /api/foodwastage
// @access  Private (Admin)
exports.createFoodWastage = asyncHandler(async (req, res, next) => {
  const { date, mealType, foodPrepared, foodConsumed, studentsPresent, weather, notes } = req.body;

  // Get average feedback score for the meal
  const feedbackDate = new Date(date);
  feedbackDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(feedbackDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const feedbackStats = await MealFeedback.aggregate([
    {
      $match: {
        date: { $gte: feedbackDate, $lt: nextDay },
        mealType
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  const averageFeedbackScore = feedbackStats.length > 0 ? feedbackStats[0].averageRating : 0;

  const foodWastage = await FoodWastage.create({
    date,
    mealType,
    foodPrepared,
    foodConsumed,
    studentsPresent,
    averageFeedbackScore,
    weather,
    notes,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: foodWastage
  });
});

// @desc    Get all food wastage records
// @route   GET /api/foodwastage
// @access  Private (Admin)
exports.getAllFoodWastage = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  let query = {};
  if (req.query.mealType) {
    query.mealType = req.query.mealType;
  }
  if (req.query.startDate && req.query.endDate) {
    query.date = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const total = await FoodWastage.countDocuments(query);
  const foodWastage = await FoodWastage.find(query)
    .populate('createdBy', 'name')
    .sort('-date')
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: foodWastage.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: foodWastage
  });
});

// @desc    Get food wastage statistics
// @route   GET /api/foodwastage/stats
// @access  Private (Admin)
exports.getFoodWastageStats = asyncHandler(async (req, res, next) => {
  // Overall statistics
  const overallStats = await FoodWastage.aggregate([
    {
      $group: {
        _id: null,
        totalWastage: { $sum: '$wastage' },
        averageWastage: { $avg: '$wastage' },
        totalFoodPrepared: { $sum: '$foodPrepared' },
        totalFoodConsumed: { $sum: '$foodConsumed' }
      }
    }
  ]);

  // Wastage by meal type
  const wastageByMealType = await FoodWastage.aggregate([
    {
      $group: {
        _id: '$mealType',
        totalWastage: { $sum: '$wastage' },
        averageWastage: { $avg: '$wastage' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Weekly trend
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const weeklyTrend = await FoodWastage.aggregate([
    {
      $match: {
        date: { $gte: weekAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalWastage: { $sum: '$wastage' },
        averageWastage: { $avg: '$wastage' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Monthly trend
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  monthAgo.setHours(0, 0, 0, 0);

  const monthlyTrend = await FoodWastage.aggregate([
    {
      $match: {
        date: { $gte: monthAgo }
      }
    },
    {
      $group: {
        _id: { 
          week: { $week: '$date' },
          year: { $year: '$date' }
        },
        totalWastage: { $sum: '$wastage' },
        averageWastage: { $avg: '$wastage' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.week': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overallStats: overallStats[0] || {},
      wastageByMealType,
      weeklyTrend,
      monthlyTrend
    }
  });
});

// @desc    Upload CSV training data
// @route   POST /api/foodwastage/upload-csv
// @access  Private (Admin)
exports.uploadTrainingData = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a CSV file', 400));
  }

  const filePath = req.file.path;
  const results = [];

  // Parse CSV file
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Convert CSV data to MongoDB format
        const trainingRecords = results.map(record => ({
          date: new Date(record.date || Date.now()),
          mealType: record.meal_type || record.mealType || 'lunch',
          studentsPresent: parseInt(record.students_present || record.studentsPresent || 0),
          foodPrepared: parseFloat(record.food_prepared || record.foodPrepared || 0),
          foodConsumed: parseFloat(record.food_consumed || record.foodConsumed || 0),
          wastage: parseFloat(record.wastage || 0),
          weather: record.weather || 'sunny',
          dayOfWeek: record.day_of_week || record.dayOfWeek || 
            new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' }),
          averageFeedbackScore: parseFloat(record.average_feedback_score || record.averageFeedbackScore || 3.5),
          uploadedBy: req.user.id
        }));

        // Insert into MongoDB
        const inserted = await TrainingData.insertMany(trainingRecords);

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({
          success: true,
          message: `Successfully imported ${inserted.length} records`,
          data: {
            rowsImported: inserted.length,
            filename: req.file.originalname,
            modelCreated: true
          }
        });
      } catch (error) {
        console.error('CSV Import Error:', error);
        // Clean up file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return next(new ErrorResponse(`Failed to import CSV: ${error.message}`, 500));
      }
    })
    .on('error', (error) => {
      // Clean up file on parsing error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return next(new ErrorResponse(`CSV parsing error: ${error.message}`, 400));
    });
});

// @desc    Predict food wastage using Gemini AI
// @route   POST /api/foodwastage/predict
// @access  Private (Admin)
exports.predictFoodWastage = asyncHandler(async (req, res, next) => {
  const { date, mealType, studentsPresent, weather, foodPrepared } = req.body;

  try {
    // Get training data from MongoDB
    const trainingData = await TrainingData.find()
      .sort({ date: -1 })
      .limit(100)
      .lean();

    if (trainingData.length === 0) {
      return next(new ErrorResponse('No training data available. Please upload CSV data first.', 400));
    }

    // Convert MongoDB data to format expected by Gemini service
    const formattedData = trainingData.map(record => ({
      date: record.date.toISOString().split('T')[0],
      meal_type: record.mealType,
      students_present: record.studentsPresent,
      food_prepared: record.foodPrepared,
      food_consumed: record.foodConsumed,
      wastage: record.wastage,
      weather: record.weather,
      day_of_week: record.dayOfWeek,
      average_feedback_score: record.averageFeedbackScore
    }));

    // Prepare prediction input
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const predictionInput = {
      date,
      mealType,
      studentsPresent,
      weather,
      dayOfWeek,
      foodPrepared
    };

    // Use Gemini AI for prediction
    const result = await geminiService.predictFoodWastage(formattedData, predictionInput);

    // Calculate food consumed based on prediction
    const predictedWastage = result.prediction.predictedWastage;
    const foodConsumed = foodPrepared - predictedWastage;

    // Save prediction to database
    const foodWastageRecord = await FoodWastage.create({
      date: new Date(date),
      mealType,
      foodPrepared,
      foodConsumed: Math.max(0, foodConsumed), // Ensure non-negative
      wastage: predictedWastage,
      studentsPresent,
      weather,
      notes: `AI Prediction - Confidence: ${result.prediction.confidence}% - ${result.prediction.recommendation}`,
      createdBy: req.user.id
    });

    // Also get MongoDB statistics for comparison
    const sevenDaysAgo = new Date(date);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pastWastage = await FoodWastage.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo, $lt: new Date(date) },
          mealType
        }
      },
      {
        $group: {
          _id: null,
          averageWastage: { $avg: '$wastage' }
        }
      }
    ]);

    const past7DayAvg = pastWastage.length > 0 ? pastWastage[0].averageWastage : 0;

    res.status(200).json({
      success: true,
      data: {
        ...result.prediction,
        dayOfWeek,
        past7DayAvg: Math.round(past7DayAvg * 100) / 100,
        trainingDataUsed: trainingData.length,
        predictionSource: result.fallback ? 'CSV Statistical Analysis' : 'Gemini AI',
        savedToDatabase: true,
        recordId: foodWastageRecord._id
      }
    });
  } catch (error) {
    console.error('Prediction Error:', error);
    return next(new ErrorResponse(error.message, 500));
  }
});

// @desc    Get training data statistics
// @route   GET /api/foodwastage/training-stats
// @access  Private (Admin)
exports.getTrainingStats = asyncHandler(async (req, res, next) => {
  try {
    // Overall statistics
    const overallStats = await TrainingData.aggregate([
      {
        $group: {
          _id: null,
          total_records: { $sum: 1 },
          avg_wastage: { $avg: '$wastage' },
          avg_food_prepared: { $avg: '$foodPrepared' },
          avg_students: { $avg: '$studentsPresent' }
        }
      }
    ]);

    // Get date range
    const dateRange = await TrainingData.find()
      .sort({ date: 1 })
      .select('date')
      .limit(1);
    
    const latestDate = await TrainingData.find()
      .sort({ date: -1 })
      .select('date')
      .limit(1);

    const stats = overallStats.length > 0 ? {
      ...overallStats[0],
      earliest_date: dateRange.length > 0 ? dateRange[0].date.toISOString().split('T')[0] : null,
      latest_date: latestDate.length > 0 ? latestDate[0].date.toISOString().split('T')[0] : null
    } : {};

    // Meal type statistics
    const mealTypeStats = await TrainingData.aggregate([
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 },
          avg_wastage: { $avg: '$wastage' }
        }
      }
    ]);

    // Recent uploads (get unique upload batches)
    const recentUploads = await TrainingData.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          rows_imported: { $sum: 1 },
          upload_date: { $first: '$createdAt' }
        }
      },
      { $sort: { upload_date: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overallStats: stats,
        mealTypeStats,
        recentUploads,
        totalRecords: await TrainingData.countDocuments()
      }
    });
  } catch (error) {
    console.error('Training Stats Error:', error);
    return next(new ErrorResponse('Failed to fetch training statistics', 500));
  }
});

// @desc    Update food wastage record
// @route   PUT /api/foodwastage/:id
// @access  Private (Admin)
exports.updateFoodWastage = asyncHandler(async (req, res, next) => {
  let foodWastage = await FoodWastage.findById(req.params.id);

  if (!foodWastage) {
    return next(new ErrorResponse('Food wastage record not found', 404));
  }

  foodWastage = await FoodWastage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: foodWastage
  });
});

// @desc    Delete food wastage record
// @route   DELETE /api/foodwastage/:id
// @access  Private (Admin)
exports.deleteFoodWastage = asyncHandler(async (req, res, next) => {
  const foodWastage = await FoodWastage.findById(req.params.id);

  if (!foodWastage) {
    return next(new ErrorResponse('Food wastage record not found', 404));
  }

  await foodWastage.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
