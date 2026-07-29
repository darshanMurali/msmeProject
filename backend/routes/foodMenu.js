const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getFoodMenu,
  getFoodMenuById,
  createFoodMenu,
  updateFoodMenu,
  deleteFoodMenu,
  getWeeklyMenu
} = require('../controllers/foodMenuController');

router.route('/')
  .get(getFoodMenu)
  .post(protect, authorize('admin', 'superadmin'), createFoodMenu);

router.route('/weekly')
  .get(getWeeklyMenu);

router.route('/:id')
  .get(getFoodMenuById)
  .put(protect, authorize('admin', 'superadmin'), updateFoodMenu)
  .delete(protect, authorize('admin', 'superadmin'), deleteFoodMenu);

module.exports = router;
