const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getProductsByCategory
} = require('../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'superadmin'), createProduct);

router.route('/category/:category')
  .get(getProductsByCategory);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin', 'superadmin'), updateProduct)
  .delete(protect, authorize('admin', 'superadmin'), deleteProduct);

router.route('/:id/stock')
  .patch(protect, authorize('admin', 'superadmin'), updateStock);

module.exports = router;
