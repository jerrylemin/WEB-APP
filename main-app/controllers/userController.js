// controllers/userController.js

const User = require('../models/userModel');

// Hiển thị trang cá nhân
exports.getProfile = (req, res) => {
    if (!req.user) {
        req.flash('error_msg', 'Vui lòng đăng nhập để xem hồ sơ');
        return res.redirect('/login');
    }
    res.render('client/profile', { user: req.user, title: 'Hồ Sơ Của Bạn' });
};

// Hiển thị form cập nhật số dư
exports.editBalanceForm = (req, res) => {
    res.render('client/editBalance', { user: req.user, title: 'Cập Nhật Số Dư' });
};

// Xử lý cập nhật số dư
exports.updateBalance = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user._id);

        user.balance = user.balance + parseFloat(amount);
        await user.save();

        req.flash('success_msg', 'Cập nhật số dư thành công');
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating balance:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật số dư');
        res.redirect('/profile');
    }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            req.flash('error_msg', 'Người dùng không tồn tại');
            return res.redirect('/profile');
        }

        user.name = name || user.name;
        user.email = email || user.email;
        if (password && password.length >= 6) {
            user.password = password; // Bạn cần đảm bảo mật khẩu được mã hóa trước khi lưu
        }

        await user.save();
        req.flash('success_msg', 'Cập nhật hồ sơ thành công');
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating profile:', err);
        req.flash('error_msg', 'Đã xảy ra lỗi khi cập nhật hồ sơ');
        res.redirect('/profile/edit');
    }
};

// Hiển thị form chỉnh sửa hồ sơ
exports.editProfile = (req, res) => {
    if (!req.user) {
        req.flash('error_msg', 'Vui lòng đăng nhập để chỉnh sửa hồ sơ');
        return res.redirect('/login');
    }
    res.render('client/editProfile', { user: req.user, title: 'Chỉnh Sửa Hồ Sơ' });
};