// createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Các tùy chọn kết nối nếu cần
        });
        console.log('MongoDB Connected');

        const email = 'admin@gmail.com'; // Địa chỉ email admin
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('Admin đã tồn tại:', existingAdmin);
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt); // Mật khẩu admin

        const admin = new User({
            name: 'Admin',
            email,
            password: hashedPassword,
            isAdmin: true
        });

        await admin.save();
        console.log('Tài khoản admin đã được tạo:', admin);
        process.exit();
    } catch (err) {
        console.error('Lỗi khi tạo admin:', err);
        process.exit(1);
    }
};

createAdmin();
