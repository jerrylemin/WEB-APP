// controllers/userController.js

const User = require('../models/userModel');

// Hiển thị trang cá nhân
exports.getProfile = (req, res) => {
    res.render('client/profile', { user: req.user });
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        await User.findByIdAndUpdate(req.user._id, { name, email });
        req.flash('success_msg', 'Cập nhật thông tin thành công');
        res.redirect('/users/profile');
    } catch (err) {
        console.log(err);
        res.redirect('/users/profile');
    }
};
