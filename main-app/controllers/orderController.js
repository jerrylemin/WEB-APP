// controllers/orderController.js

const axios = require('axios');
const jwt = require('jsonwebtoken'); // Thêm dòng này để sử dụng jwt
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');

exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('cart.items.product')
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
        // Lấy thông tin giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
            return res.redirect('/cart');
        }

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: req.user._id,
            cart: {
                items: cart.items,
                totalPrice: cart.totalPrice
            },
            status: 'Pending'
        });

        await newOrder.save();

        // Thực hiện thanh toán qua hệ thống phụ
        try {
            // Tạo JWT token để xác thực với hệ thống phụ
            const token = jwt.sign({ id: req.user.id }, 'secretKey'); // Lưu ý: 'secretKey' nên được lưu trong biến môi trường

            // Gửi yêu cầu tới hệ thống phụ
            const response = await axios.post('http://localhost:6000/transactions/transfer', {
                fromUserId: req.user.id,
                amount: cart.totalPrice
            }, {
                headers: {
                    'Authorization': token
                }
            });

            if (response.data.error) {
                req.flash('error_msg', 'Thanh toán thất bại');
                return res.redirect('/cart');
            }

            // Cập nhật trạng thái đơn hàng sau khi thanh toán thành công
            newOrder.status = 'Paid';
            await newOrder.save();

            // Xóa giỏ hàng của người dùng
            await Cart.findOneAndDelete({ user: req.user._id });

            req.flash('success_msg', 'Đặt hàng thành công');
            res.redirect('/orders');
        } catch (err) {
            console.log('Lỗi trong quá trình thanh toán:', err);
            req.flash('error_msg', 'Lỗi trong quá trình thanh toán');
            res.redirect('/cart');
        }
    } catch (err) {
        console.log('Lỗi khi tạo đơn hàng:', err);
        res.redirect('/cart');
    }
};

// Hiển thị danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('cart.items.product');
        res.render('client/orders', { orders });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// Hiển thị danh sách đơn hàng cho admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('cart.items.product');
        res.render('admin/orders', { orders });
    } catch (err) {
        console.log(err);
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