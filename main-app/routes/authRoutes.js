// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const Cart = require('../models/cartModel');

const SECRET_KEY = "tm_lm_qd";

// Trang đăng nhập
router.get('/login', authController.renderLogin);

// Trang đăng ký
router.get('/register', authController.renderRegister);

// Xử lý đăng ký
router.post('/register', authController.register);

// Xác thực đăng ký
router.get('/register/verify/:token', authController.verifyRegister);

// Xử lý đăng nhập
router.post('/login', (req, res, next) => {
    const temp = req.session.cart;
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            return res.render('login', {
                msg: 'Đăng nhập không thành công'
            });
        }
        if(!user.isVerified) {
            return res.render('login', {
                msg: 'Tài khoản chưa được xác thực'
            });
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            // Khôi phục lại cart
            req.session.cart = temp; 
            // Tạo và gửi jwt token cho người dùng
            const token = jwt.sign({ userID: user._id }, SECRET_KEY, { expiresIn: '1d' }); // Tạo token
            // Lưu token người dùng vào cookie
            res.cookie('AccessToken', token, { maxAge: 86400000 }); // 1 ngày
            // Kiểm tra vai trò của người dùng
            if (user.isAdmin) {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/products');
            }
        });
        req.session.cart = temp;
    })(req, res, next)
});

// Yêu cầu xác thực bằng Google
router.get(
    '/login/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
  
// Xử lý callback từ Google
router.get(
    '/login/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        // Tạo cart cho người dùng
        const cart = new Cart({
            user: req.user._id,
            items: [],
            totalPrice: 0
        });
        await cart.save();

        // Tạo jwt token cho người dùng dựa vào userID
        const token = jwt.sign({ userID: req.user._id }, SECRET_KEY, { expiresIn: '1d' });
        
        // Lưu token vào cookie của người dùng
        res.cookie('AccessToken', token, { maxAge: 86400000 });

        // Tạo tài khoản ngân hàng cho người dùng
        const response = await fetch("https://localhost:5001/api/accounts/create", {
            method: "GET",
            headers: {
                "Access-Token": token // Token jwt của người dùng
            }
        });
        if (response.ok) {
            const resData = await response.json();
            const { bankAccountID } = resData;
            // Thêm trường bankAccountID vào newUser và lưu lại xuống cơ sở dữ liệu
            const user = await User.findOne({_id: req.user._id});
            user.bankAccountID = bankAccountID;
            await user.save();
            req.user.bankAccountID = bankAccountID;
        }
        res.status(200).redirect('/');
    }
);

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

