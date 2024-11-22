// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuthenticated, isAdmin } = require('../utils/authMiddleware');

// Tạo đơn hàng
router.post('/create', ensureAuthenticated, orderController.createOrder);

// Hiển thị đơn hàng của người dùng
router.get('/', ensureAuthenticated, orderController.getUserOrders);

// Hiển thị tất cả đơn hàng cho admin
router.get('/admin', isAdmin, orderController.getAllOrders);

// Cập nhật trạng thái đơn hàng
router.post('/admin/update/:id', isAdmin, orderController.updateOrderStatus);

module.exports = router;
