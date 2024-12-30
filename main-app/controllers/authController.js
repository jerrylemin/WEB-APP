// controllers/authController.js 
require("dotenv").config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Admin } = require('../models/userModel');
const Cart = require('../models/cartModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios'); // Để gửi yêu cầu tới hệ thống phụ nếu cần
const fs = require('fs');

const SECRET_KEY = "tm_lm_qd";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hiển thị form quên mật khẩu
exports.getForgotPassword = (req, res) => {
    res.render('forgotPassword', { title: 'Quên Mật Khẩu' });
};

// Xử lý quên mật khẩu
exports.postForgotPassword = (req, res) => {
    const { email } = req.body;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/forgot-password');
        }
        const token = buffer.toString('hex');
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    req.flash('error_msg', 'Email không tồn tại');
                    return res.redirect('/forgot-password');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; // 1 giờ
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                // Gửi email với link reset mật khẩu
                // Cấu hình transporter cho nodemailer
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'your_email@gmail.com',
                        pass: 'your_email_password'
                    }
                });
                const mailOptions = {
                    to: email,
                    from: 'no-reply@yourapp.com',
                    subject: 'Đặt lại mật khẩu',
                    html: `
                        <p>Bạn đã yêu cầu đặt lại mật khẩu</p>
                        <p>Nhấn vào link sau để đặt lại mật khẩu: <a href="http://localhost:5000/reset-password/${token}">Đặt lại mật khẩu</a></p>
                    `
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) console.log(err);
                    else console.log('Email sent: ' + info.response);
                });
            })
            .catch(err => console.log(err));
    });
};

// Hiển thị form đặt lại mật khẩu
exports.getResetPassword = (req, res) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'Token không hợp lệ hoặc đã hết hạn');
                return res.redirect('/forgot-password');
            }
            res.render('resetPassword', { userId: user._id.toString(), passwordToken: token, title: 'Đặt Lại Mật Khẩu' });
        })
        .catch(err => console.log(err));
};

// Xử lý đặt lại mật khẩu
exports.postResetPassword = (req, res) => {
    const { password, password2, userId, passwordToken } = req.body;
    let resetUser;
    if (password !== password2) {
        req.flash('error_msg', 'Mật khẩu không khớp');
        return res.redirect('back');
    }
    User.findOne({
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() }
    })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'Token không hợp lệ hoặc đã hết hạn');
                return res.redirect('/forgot-password');
            }
            resetUser = user;
            return bcrypt.hash(password, 10);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            req.flash('success_msg', 'Đặt lại mật khẩu thành công');
            res.redirect('/login');
        })
        .catch(err => console.log(err));
};

// Cấu hình Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Kiểm tra email
    User.findOne({ email: email })
        .then(user => {
            if (!user) return done(null, false, { message: 'Email không tồn tại' });

            // Kiểm tra mật khẩu
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) return done(null, user);
                else return done(null, false, { message: 'Mật khẩu không đúng' });
            });
        })
        .catch(err => console.log(err));
}));

passport.use(
    new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if(!user) {
            // Tạo đối tượng người dùng mới
            const info = {
                name: profile.name.givenName + ' ' + profile.name.familyName,
                email: profile.emails[0].value,
                googleAuth: true,
                googleId: profile.id,
                isVerified: true
            };
            const newUser = new User(info);
            await newUser.save();
            
            user = await User.findOne({ googleId: profile.id }).lean();
            return done(null, user);

        }
        return done(null, user);
    }
    catch(err) {
        return done(err, false);
    }
}));

passport.serializeUser((user, done) => {
    // console.log("serializing...");
    console.log(user);
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

exports.renderRegister = (req, res) => {
    res.render('register', {
        msg: null,
        name: '',
        email: '',
        title: 'Đăng Ký'
    });
};

// Hàm xử lý đăng ký người dùng
exports.register = async (req, res, next) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Vui lòng nhập đầy đủ các trường' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Mật khẩu không khớp' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    if (errors.length > 0) {
        console.log('Có lỗi trong form đăng ký:', errors);
        res.render("register", {
            msg: errors[0],
            name,
            email
        });
    } else {
        try {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                errors.push({ msg: 'Email đã được sử dụng' });
                console.log('Email đã được sử dụng:', email);
                return res.render('register', {
                    msg: errors[0],
                    name,
                    email
                });
            }
        
            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Tạo đối tượng người dùng mới
            let isAdmin = false;
            let isMainAcc = false;
            try {
                const response = await Admin.findOne({email: email}); // Kiểm tra xem người dùng có phải là admin không
                if (response) {
                    isAdmin = true; // Nếu là admin thì isAdmin = true
                    if(response.mainAccount) {
                        isMainAcc = true;
                    }
                }
            }
            catch(err) {
                return next(err);
            }
            
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                isAdmin,
                mainAccount: isMainAcc
            });
            // console.log('Đối tượng người dùng mới được tạo:', newUser);
        
            // Lưu người dùng vào cơ sở dữ liệu
            await newUser.save();
            // console.log('Người dùng đã được lưu vào MongoDB');
            
            // Tạo cart cho người dùng
            const cart = new Cart({
                user: newUser._id,
                items: [],
                totalPrice: 0
            });
            await cart.save();

            // Tạo jwt token cho người dùng dựa vào userID
            const token = jwt.sign({ userID: newUser._id }, SECRET_KEY, { expiresIn: '1d' });

            const url = `https://localhost:5000/register/verify/${token}`;
            await transporter.sendMail({
                to: newUser.email,
                subject: 'Brewtiful - Xác thực email',
                html: `<h4>Chào ${newUser.name},</h4><p>Vui lòng nhấn vào liên kết sau để xác thực tài khoản của bạn: <a href="${url}">Xác thực</a></p>`
            });

            // Lưu token vào cookie của người dùng
            res.render("login", {
                msg: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản!'
            })
        } catch (err) {
            console.log(err);
            return res.render('register', {
                msg: 'Đã xảy ra lỗi trong quá trình đăng ký',
                name: '',
                email: ''
            });
        }
    }
};

exports.verifyRegister = async (req, res) => {
    const decoded = jwt.verify(req.params.token, SECRET_KEY);
    const user = await User.findById(decoded.userID);
    if (!user) {
        return res.render('login', {
            msg: 'Tài khoản không tồn tại'
        });
    }
    // console.log(user);
    try {
        // Đánh dấu tài khoản đã xác thực
        user.isVerified = true;
        await user.save();

        // Tạo tài khoản ngân hàng cho người dùng
        const response = await fetch("https://localhost:5001/api/accounts/create", {
            method: "GET",
            headers: {
                "Access-Token": req.params.token // Token jwt của người dùng
            }
        });
        if (response.ok) {
            const resData = await response.json();
            console.log(resData);
            const { bankAccountID } = resData;
            // Thêm trường bankAccountID vào newUser và lưu lại xuống cơ sở dữ liệu
            user.bankAccountID = bankAccountID;
            await user.save();
        }

        // Lưu token vào cookie của người dùng
        res.cookie('AccessToken', req.params.token, { maxAge: 86400000, httpOnly:   true });
        res.status(200).render("login", {
            msg: 'Tài khoản đã được xác thực thành công!'
        });
    } catch (err) {
        console.log(err);  
        res.render("login", {
            msg: 'Liên kết xác thực không hợp lệ hoặc đã hết hạn'
        })
    }
}

exports.renderLogin = (req, res) => {
    res.render('login', { 
        msg: null,
        title: 'Đăng Nhập' 
    });
};

// Đăng nhập người dùng
exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
};

// Hàm xử lý đăng xuất
exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.status(200).redirect("/");
    });
};
