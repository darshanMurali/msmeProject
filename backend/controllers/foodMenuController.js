const FoodMenu = require('../models/FoodMenu');

// @desc    Get food menu by date
// @route   GET /api/food-menu
// @access  Public
exports.getFoodMenu = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let query = { isActive: true };

    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.date = {
        $gte: today,
        $lt: tomorrow
      };
    }

    const menus = await FoodMenu.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: menus.length, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get food menu by ID
// @route   GET /api/food-menu/:id
// @access  Public
exports.getFoodMenuById = async (req, res) => {
  try {
    const menu = await FoodMenu.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create food menu
// @route   POST /api/food-menu
// @access  Admin only
exports.createFoodMenu = async (req, res) => {
  try {
    const menuData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Set day of week automatically
    const date = new Date(menuData.date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    menuData.dayOfWeek = days[date.getDay()];

    const menu = await FoodMenu.create(menuData);

    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update food menu
// @route   PUT /api/food-menu/:id
// @access  Admin only
exports.updateFoodMenu = async (req, res) => {
  try {
    const menu = await FoodMenu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete food menu
// @route   DELETE /api/food-menu/:id
// @access  Admin only
exports.deleteFoodMenu = async (req, res) => {
  try {
    const menu = await FoodMenu.findByIdAndDelete(req.params.id);

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.status(200).json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weekly menu
// @route   GET /api/food-menu/weekly
// @access  Public
exports.getWeeklyMenu = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get next 7 days
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const menus = await FoodMenu.find({
      date: {
        $gte: today,
        $lt: endDate
      },
      isActive: true
    }).sort({ date: 1 });

    res.status(200).json({ success: true, count: menus.length, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
