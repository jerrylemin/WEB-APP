// controllers/authController.js 

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const axios = require('axios'); // Để gửi yêu cầu tới hệ thống phụ nếu cần

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

passport.serializeUser((user, done) => {
    done(null, user.id);
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
        errors: [],
        name: '',
        email: '',
        password: '',
        password2: '',
        title: 'Đăng Ký'
    });
};


// Hàm xử lý đăng ký người dùng
exports.register = async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Vui lòng nhập đầy đủ các trường' });
    }

    // Kiểm tra mật khẩu
    if (password !== password2) {
        errors.push({ msg: 'Mật khẩu không khớp' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    if (errors.length > 0) {
        console.log('Có lỗi trong form đăng ký:', errors);
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        try {
            // Kiểm tra xem người dùng đã tồn tại chưa
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                errors.push({ msg: 'Email đã được sử dụng' });
                console.log('Email đã được sử dụng:', email);
                return res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            }
        
            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
        
            // Tạo đối tượng người dùng mới
            const newUser = new User({
                name,
                email,
                password: hashedPassword
            });
        
            console.log('Đối tượng người dùng mới được tạo:', newUser);
        
            // Lưu người dùng vào cơ sở dữ liệu
            await newUser.save();
            console.log('Người dùng đã được lưu vào MongoDB');
        
            // Tự động đăng nhập người dùng sau khi đăng ký thành công (tùy chọn)
            req.login(newUser, (err) => {
                if (err) {
                    console.log('Lỗi khi đăng nhập sau khi đăng ký:', err);
                    req.flash('error_msg', 'Đăng nhập thất bại sau khi đăng ký');
                    return res.redirect('/login');
                }
                req.flash('success_msg', 'Bạn đã đăng ký thành công và đã được đăng nhập');
                res.redirect('/products');
            });
        
        } catch (err) {
            console.log('Lỗi trong quá trình đăng ký:', err);
            req.flash('error_msg', 'Đã xảy ra lỗi trong quá trình đăng ký');
            res.redirect('/register');
        }
    }
};

exports.renderLogin = (req, res) => {
    res.render('login', { title: 'Đăng Nhập' });
};


// Đăng nhập người dùng
exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/products',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
};

// Hàm xử lý đăng xuất
exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'Bạn đã đăng xuất thành công');
        res.redirect('/login');
    });
};
