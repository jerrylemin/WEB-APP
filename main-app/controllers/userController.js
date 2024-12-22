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
        const { name, email, address, phoneNumber } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).send("Người dùng không tồn tại.");
        }

        if(name) {
            user.name = name;
        }
        if(email) {
            user.email = email;
        }
        if(address) {
            user.address = address;
        }
        if(phoneNumber) {
            user.phoneNumber = phoneNumber;
        }
        await user.save();
        console.log(user);
        return res.status(200).redirect("/profile");
    } catch (err) {
        console.error('Error updating profile:', err);
        return res.status(500).send("Đã xảy ra lỗi khi cập nhật hồ sơ!");
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