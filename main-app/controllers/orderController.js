// controllers/orderController.js

// const axios = require('axios');
// const jwt = require('jsonwebtoken'); // Thêm dòng này để sử dụng jwt
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { sendOrderConfirmationToAdmin } = require('../utils/notification');

// Render trang xác nhận thanh toán
exports.getCheckout = async (req, res) => {
    const cart = await Cart.findOne({user: req.user._id}).lean();
    console.log(cart);
    if (!cart || cart.items.length === 0) {
        return res.status(400).redirect('/cart', {
            message: 'Giỏ hàng của bạn đang trống'
        });
    }
    const response = await fetch(   "https://localhost:5001/api/accounts/balance", {
        method: "GET",
        headers: {
            "access-token": req.cookies['AccessToken'] // Token jwt của người dùng
        }
    });
    const resData = await response.json();
    const balance = resData.balance;
    res.status(200).render('client/checkout', { balance, cart, user: req.user, title: 'Xác Nhận Thanh Toán' } );
};

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

        res.status(200).render('admin/viewOrder', { order, title: 'Chi Tiết Đơn Hàng' });

    } catch (err) {
        res.status(500).redirect('/admin/orders', { message: 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng' });
    }
};

// Tạo đơn hàng
exports.createOrder = async (req, res) => {
    try {
        const foundCart = await Cart.findOne({ user: req.user._id });
        if (!foundCart || foundCart.items.length === 0) {
            return res.status(400).redirect('/cart');
        }        

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: req.user._id,
            cart: {
                items: foundCart.items, 
                totalPrice: foundCart.totalPrice
            },
            status: 'Pending' // Trạng thái chờ xác nhận
        });
        await newOrder.save();

        // Dùng API để yêu cầu hệ thống thanh toán thực hiện giao dịch
        const response = await fetch('https://localhost:5001/api/transactions/transfer', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "access-token": req.cookies['AccessToken'] // Token jwt của người dùng                
            },
            body: JSON.stringify({amount: foundCart.totalPrice})
        });
        const resData = await response.json();
        console.log(resData);

        // Nếu giao dịch thành công
        if(!resData.error) {
            // Trừ số lượng trong kho
            for (let item of foundCart.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    if (product.stock < 0) product.stock = 0; // Đảm bảo stock không âm
                    await product.save();
                    console.log(`Product stock updated for ${product.name}: ${product.stock}`);
                }
            }
    
            // Xóa giỏ hàng
            foundCart.items = [];
            await foundCart.save();
            
            // Cập nhật trạng thái đơn hàng thành Confirmed
            newOrder.status = "Confirmed";
            await newOrder.save();

            return res.status(200).redirect('/orders?message=Thanh toán thành công!');
        }
        // Nếu thất bại -> Cập nhật trạng thái đơn hàng thành Cancelled
        newOrder.status = "Cancelled";
        await newOrder.save();

        return res.status(500).redirect('/orders?message=Thanh toán thất bại');
        
    } catch (err) {
        res.status(500).redirect('/cart?message=Có lỗi xảy ra khi thanh toán');
    }
};

// Hiển thị danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
    try {
        const message = req.query.message;
        const orders = await Order.find({ user: req.user._id })
            .populate('cart.items.product')
            .lean();
        res.render('client/orders', { orders, title: 'Đơn Hàng Của Bạn', message });
    } catch (err) {
        res.redirect('/?message=Đã xảy ra lỗi khi lấy danh sách đơn hàng');
    }
};

// Hiển thị danh sách đơn hàng cho admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('cart.items.product').lean();
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
        res.status(200).redirect('/admin/orders');
    } catch (err) {
        res.status(500).redirect('/admin/orders');
    }
};

// Render danh sách các đơn hàng
exports.listOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').lean();
        res.status(200).render('admin/orders', { orders, title: 'Quản Lý Đơn Hàng' });
    } catch (err) {
        res.status(500).redirect('/admin/dashboard');
    }
};

exports.viewOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Kiểm tra xem orderId có phải là một ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).redirect('/orders');
        }

        const order = await Order.findOne({ _id: orderId, user: req.user._id })
            .populate('cart.items.product') 
            .lean();

        if (!order) {
            return res.status(400).redirect('/orders');
        }

        res.status(200).render('client/orderDetails', { order, title: 'Chi Tiết Đơn Hàng' });
    } catch (err) {
        console.log(err);
        res.status(500).redirect('/orders');
    }
};

// Kiểm tra xem các hàm khác đã được định nghĩa và export đúng cách
console.log('Order Controller loaded successfully');