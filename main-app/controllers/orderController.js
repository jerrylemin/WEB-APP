// controllers/orderController.js

// const axios = require('axios');
// const jwt = require('jsonwebtoken'); // Thêm dòng này để sử dụng jwt
const Order = require('../models/orderModel');
// const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { sendOrderConfirmationToAdmin } = require('../utils/notification');

exports.getCheckout = (req, res) => {
    const cart = req.session.cart;
    if (!cart || cart.items.length === 0) {
        req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
        return res.redirect('/cart');
    }
    res.render('client/checkout', { cart, user: req.user, title: 'Xác Nhận Thanh Toán' });
};
exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('cart.items.productId')
            .lean();

        if (!order) {
            req.flash('error_msg', 'Đơn hàng không tồn tại');
            return res.redirect('/admin/orders');
        }

        res.render('admin/viewOrder', { order, title: 'Chi Tiết Đơn Hàng' });

    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng');
        res.redirect('/admin/orders');
    }
};

exports.createOrder = async (req, res) => {
    try {
        console.log('Received POST /orders/create request');
        const cart = req.session.cart;
        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
            return res.redirect('/cart');
        }

        // Kiểm tra số dư của người dùng
        const user = await User.findById(req.user._id);
        if (user.balance < cart.totalPrice) {
            req.flash('error_msg', 'Số dư không đủ để thanh toán');
            return res.redirect('/cart');
        }

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: req.user._id,
            cart: cart,
            status: 'Pending' // Trạng thái chờ xác nhận
        });
        await newOrder.save();
        console.log('Order created:', newOrder);

        // Trừ số dư của người dùng
        user.balance -= cart.totalPrice;
        await user.save();
        console.log('User balance updated:', user.balance);

        // Trừ số lượng trong kho
        for (let item of cart.items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                if (product.stock < 0) product.stock = 0; // Đảm bảo stock không âm
                await product.save();
                console.log(`Product stock updated for ${product.name}: ${product.stock}`);
            }
        }

        // Gửi yêu cầu đến admin (có thể gửi email hoặc thông báo)
        await sendOrderConfirmationToAdmin(newOrder);
        console.log('Order confirmation sent to admin');

        // Xóa giỏ hàng
        req.session.cart = { items: [], totalPrice: 0 };
        console.log('Cart cleared');

        req.flash('success_msg', 'Đặt hàng thành công. Đơn hàng đang chờ xác nhận từ admin.');
        res.redirect('/orders');
    } catch (err) {
        console.error('Error in createOrder:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi thanh toán');
        res.redirect('/cart');
    }
};

// Hiển thị danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('cart.items.productId') // Sửa từ 'product' thành 'productId'
            .lean();
        res.render('client/orders', { orders, title: 'Đơn Hàng Của Bạn' });
    } catch (err) {
        console.log('Error fetching user orders:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách đơn hàng');
        res.redirect('/');
    }
};

// Hiển thị danh sách đơn hàng cho admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('cart.items.productId').lean();
        res.render('admin/orders', { orders, title: 'Quản Lý Đơn Hàng' });
    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách đơn hàng');
        res.redirect('/admin');
    }
};

// Cập nhật trạng thái đơn hàng (admin)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await Order.findByIdAndUpdate(req.params.id, { status });
        req.flash('success_msg', 'Cập nhật trạng thái đơn hàng thành công');
        res.redirect('/admin/orders');
    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng');
        res.redirect('/admin/orders');
    }
};

exports.listOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').lean();
        res.render('admin/orders', { orders, title: 'Quản Lý Đơn Hàng' });
    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy danh sách đơn hàng');
        res.redirect('/admin/dashboard');
    }
};

exports.viewOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Kiểm tra xem orderId có phải là một ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            req.flash('error_msg', 'Đơn hàng không tồn tại');
            return res.redirect('/orders');
        }

        const order = await Order.findOne({ _id: orderId, user: req.user._id })
            .populate('cart.items.productId') // Sửa từ 'product' thành 'productId'
            .lean();

        if (!order) {
            req.flash('error_msg', 'Đơn hàng không tồn tại');
            return res.redirect('/orders');
        }

        res.render('client/orderDetails', { order, title: 'Chi Tiết Đơn Hàng' });
    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng');
        res.redirect('/orders');
    }
};


// Kiểm tra xem các hàm khác đã được định nghĩa và export đúng cách
console.log('Order Controller loaded successfully');