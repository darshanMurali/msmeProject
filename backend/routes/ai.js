const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const FoodWastage = require('../models/FoodWastage');
const TrainingData = require('../models/TrainingData');
const Attendance = require('../models/Attendance');
const FoodMenu = require('../models/FoodMenu');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/ai/predict/food-wastage
// @desc    Predict food wastage using Gemini AI
// @access  Admin
router.post('/predict/food-wastage', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { date, mealType, studentsPresent, foodPrepared, weather, dayOfWeek } = req.body;

    // Fetch training data
    const trainingData = await TrainingData.find().lean();

    // Make prediction
    const result = await geminiService.predictFoodWastage(trainingData, {
      date,
      mealType,
      studentsPresent,
      foodPrepared,
      weather,
      dayOfWeek
    });

    res.json({
      success: true,
      data: result.prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/ai/analyze/wastage-trends
// @desc    Analyze food wastage trends
// @access  Admin
router.get('/analyze/wastage-trends', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const trainingData = await TrainingData.find().lean();
    const analysis = await geminiService.analyzeWastageTrends(trainingData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/ai/recommendations/products
// @desc    Get personalized product recommendations
// @access  Private
router.get('/recommendations/products', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's purchase and browsing history
    const orders = await Order.find({ user: userId }).populate('items.product').lean();
    const purchaseHistory = orders.map(order => ({
      date: order.createdAt,
      items: order.items.map(item => ({
        name: item.name,
        category: item.product?.category,
        quantity: item.quantity
      }))
    }));

    // For now, empty browsing history (can be enhanced with tracking)
    const browsingHistory = [];

    const recommendations = await geminiService.recommendProducts(userId, purchaseHistory, browsingHistory);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/ai/analyze/attendance
// @desc    Analyze attendance patterns
// @access  Admin
router.get('/analyze/attendance', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const attendanceData = await Attendance.find()
      .populate('student', 'name studentType')
      .lean();

    const analysis = await geminiService.analyzeAttendancePatterns(attendanceData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/ai/optimize/menu
// @desc    Get menu optimization suggestions
// @access  Admin
router.post('/optimize/menu', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { menuId } = req.body;

    // Get current menu
    const currentMenu = menuId 
      ? await FoodMenu.findById(menuId).lean()
      : await FoodMenu.findOne().sort({ date: -1 }).lean();

    // Get recent feedback
    const feedbackData = await Feedback.find({ category: 'food' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get wastage data
    const wastageData = await FoodWastage.find()
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const suggestions = await geminiService.optimizeMenuSuggestions(
      currentMenu,
      feedbackData,
      wastageData
    );

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/ai/analyze/feedback-sentiment
// @desc    Analyze feedback sentiment
// @access  Admin
router.post('/analyze/feedback-sentiment', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { feedbackText, category } = req.body;

    const analysis = await geminiService.analyzeFeedbackSentiment(feedbackText, category);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/ai/chat/response
// @desc    Generate smart chat response
// @access  Private
router.post('/chat/response', protect, async (req, res) => {
  try {
    const { conversationHistory, query } = req.body;

    const response = await geminiService.generateChatResponse(
      conversationHistory || [],
      query
    );

    res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/ai/forecast/demand
// @desc    Forecast product demand
// @access  Admin
router.post('/forecast/demand', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { productId } = req.body;

    // Get historical sales
    const orders = await Order.find({ 'items.product': productId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const historicalSales = orders.map(order => {
      const item = order.items.find(i => i.product.toString() === productId);
      return {
        date: order.createdAt,
        quantity: item ? item.quantity : 0
      };
    });

    // Seasonality data (simplified)
    const seasonality = {
      month: new Date().getMonth() + 1,
      season: 'current'
    };

    const forecast = await geminiService.forecastProductDemand(
      productId,
      historicalSales,
      seasonality
    );

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/ai/analyze/student-behavior
// @desc    Analyze student behavior
// @access  Admin
router.post('/analyze/student-behavior', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { studentId } = req.body;

    // Gather student data
    const attendance = await Attendance.find({ student: studentId }).lean();
    const orders = await Order.find({ user: studentId }).lean();
    const feedback = await Feedback.find({ student: studentId }).lean();

    const studentData = {
      attendanceRecords: attendance.length,
      attendanceRate: attendance.length > 0 ? '85%' : '0%',
      orderCount: orders.length,
      feedbackCount: feedback.length,
      recentActivity: attendance.slice(-10)
    };

    const analysis = await geminiService.analyzeStudentBehavior(studentData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/ai/health
// @desc    Check Gemini AI service health
// @access  Public
router.get('/health', (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  
  res.json({
    success: true,
    service: 'Gemini AI',
    status: isConfigured ? 'active' : 'not configured',
    message: isConfigured 
      ? 'Gemini AI is ready to use' 
      : 'GEMINI_API_KEY not found in environment variables',
    capabilities: [
      'Food Wastage Prediction',
      'Product Recommendations',
      'Attendance Analysis',
      'Menu Optimization',
      'Sentiment Analysis',
      'Smart Chat Responses',
      'Demand Forecasting',
      'Student Behavior Analytics'
    ]
  });
});

module.exports = router;
