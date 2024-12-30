// controllers/userController.js

const { User } = require('../models/userModel');

// Lấy id người dùng với tài khoản nhận thanh toán chính
exports.getMainAccount = async (req, res, next) => {
    try {
        const response = await User.findOne({mainAccount: true}).lean();
        if(response) {
            return res.status(200).json({message: null, id: response._id});
        }
        return res.status(404).json({message: 'Không tìm thấy tài khoản nhận thanh toán chính'});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({message: 'Có lỗi xảy ra khi lấy id người dùng với tài khoản nhận thanh toán chính', error: err});
    }
}

// Hiển thị trang cá nhân
exports.getProfile = async (req, res, next) => {
    try {
        console.log("Profile user id: ");
        console.log(req.user._id);
        const response = await fetch("https://localhost:5001/api/accounts/balance", {
            method: "GET",
            headers: {
                "access-token": req.cookies['AccessToken'] // Token jwt của người dùng
            }
        });

        const resData = await response.json();
        res.render('client/profile', { user: req.user, title: 'Hồ Sơ Của Bạn', balance: parseInt(resData.balance) });
    }
    catch(err) {
        return next(err);
    }
};

// Hiển thị form cập nhật số dư
exports.editBalanceForm = async (req, res, next) => {
    // Lấy số dư
    try {
        const response = await fetch("https://localhost:5001/api/accounts/balance", {
            method: "GET",
            headers: {
                "access-token": req.cookies['AccessToken'] // Token jwt của người dùng
            }
        });
        const resData = await response.json();
        res.render('client/editBalance', { balance: parseInt(resData.balance), title: 'Cập Nhật Số Dư' });
    }
    catch(err) {
        return next(err);
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