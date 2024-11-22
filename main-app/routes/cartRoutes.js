// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { ensureAuthenticated } = require('../utils/authMiddleware');

// Hiển thị giỏ hàng
router.get('/', ensureAuthenticated, cartController.getCart);

// Thêm sản phẩm vào giỏ hàng
router.post('/add/:id', ensureAuthenticated, cartController.addToCart);

// Cập nhật giỏ hàng
router.post('/update', ensureAuthenticated, cartController.updateCart);

// Xóa sản phẩm khỏi giỏ hàng
router.get('/remove/:id', ensureAuthenticated, cartController.removeFromCart);

module.exports = router;
