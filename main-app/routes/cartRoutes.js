// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// Hiển thị giỏ hàng
router.get('/', cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/add/:id', cartController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng
router.post('/remove/:id', cartController.removeFromCart);

// Hiển thị trang thanh toán
router.get('/checkout', ensureAuthenticated, cartController.getCheckout);

// Xử lý thanh toán
router.post('/checkout', ensureAuthenticated, cartController.postCheckout);

module.exports = router;
