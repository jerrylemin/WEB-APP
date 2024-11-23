// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { ensureAuthenticated } = require('../utils/authMiddleware');
const initializeCart = require('../middleware/cartMiddleware');

// Sử dụng middleware để khởi tạo cart
router.use(initializeCart);

// Route hiển thị giỏ hàng
router.get('/cart', cartController.getCart);

// Hiển thị giỏ hàng
router.get('/', ensureAuthenticated, cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/add/:id', ensureAuthenticated, cartController.addToCart);

// Cập nhật giỏ hàng
router.post('/update', ensureAuthenticated, cartController.updateCart);

// Xóa sản phẩm khỏi giỏ hàng
router.get('/remove/:id', ensureAuthenticated, cartController.removeFromCart);

module.exports = router;
