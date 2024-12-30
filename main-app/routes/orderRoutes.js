// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuthenticated, isAdmin } = require('../utils/authMiddleware');

// Logging để kiểm tra orderController
// console.log('Order Controller:', orderController);

// Route hiển thị trang xác nhận thanh toán (đặt trước các route động)
router.get('/checkout', ensureAuthenticated, orderController.getCheckout);

// Route tạo đơn hàng (cần đặt trước)
router.post('/create', ensureAuthenticated, orderController.createOrder);

// Route xem danh sách đơn hàng của người dùng
router.get('/', ensureAuthenticated, orderController.getUserOrders);

// Route xem chi tiết đơn hàng (đặt sau cùng)
router.get('/:id', ensureAuthenticated, orderController.viewOrderDetails);

// Hiển thị tất cả đơn hàng cho admin
router.get('/admin', ensureAuthenticated, isAdmin, orderController.getAllOrders);

// Route quản trị để liệt kê đơn hàng
router.get('/admin/orders', ensureAuthenticated, isAdmin, orderController.listOrders);

// Route để xem chi tiết đơn hàng (Admin)
router.get('/admin/orders/view/:id', ensureAuthenticated, isAdmin, orderController.viewOrder);

// Route để cập nhật trạng thái đơn hàng (Admin)
router.post('/admin/orders/update/:id', ensureAuthenticated, isAdmin, orderController.updateOrderStatus);

// // Cập nhật trạng thái đơn hàng
// router.post('/admin/update/:id', isAdmin, orderController.updateOrderStatus);

module.exports = router;
