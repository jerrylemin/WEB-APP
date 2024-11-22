// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const axios = require('axios');
// Trang đăng nhập
router.get('/login', authController.renderLogin);

// Trang đăng ký
router.get('/register', authController.renderRegister);

// Xử lý đăng ký
router.post('/register', authController.register);

// Xử lý đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.get('/logout', authController.logout);

// // Trong phần đăng ký người dùng
// newUser.save()
//     .then(async user => {
//         // Gửi yêu cầu tạo tài khoản thanh toán
//         try {
//             await axios.post('http://localhost:6000/accounts/create', {
//                 userId: user.id
//             });
//         } catch (err) {
//             console.log('Lỗi khi tạo tài khoản thanh toán:', err);
//         }

//         req.flash('success_msg', 'Bạn đã đăng ký thành công và có thể đăng nhập');
//         res.redirect('/login');
//     })
//     .catch(err => console.log(err));

// Quên mật khẩu
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Đặt lại mật khẩu
router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

module.exports = router;

