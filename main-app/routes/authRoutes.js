// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "tm_lm_qd";

// Trang đăng nhập
router.get('/login', authController.renderLogin);

// Trang đăng ký
router.get('/register', authController.renderRegister);

// Xử lý đăng ký
router.post('/register', authController.register);

// Xử lý đăng nhập
// Sử dụng custom callback cho đăng nhập
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('error_msg', info.message || 'Đăng nhập không thành công');
            return res.render('login', {
                error_msg: req.flash('error_msg')
            });
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            // Tạo và gửi jwt token cho người dùng
            const token = jwt.sign({ userID: user._id }, SECRET_KEY, { expiresIn: '1d' }); // Tạo token
            // Lưu token người dùng vào cookie
            res.cookie('AccessToken', token, { maxAge: 86400000, httpOnly: true }); // 1 ngày
            // Kiểm tra vai trò của người dùng
            if (user.isAdmin) {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/products');
            }
        });
    })(req, res, next);
});

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

