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
exports.editBalanceForm = async (req, res, next) => {
    // Lấy số dư
    const bankAccountID = req.user.bankAccountID;
    console.log(bankAccountID);
    try {
        const bankAcc = await fetch(`/bank/balance/${req.user.bankAccountID}`);
        const balance = await bankAcc.text();
    }
    catch(err) {
        return next(err);
    }
    res.render('client/editBalance', { user: req.user, balance: parseInt(balance), title: 'Cập Nhật Số Dư' });
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