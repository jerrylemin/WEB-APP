// models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Đảm bảo email là duy nhất
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false // Mặc định không phải admin
    },
    resetToken: String,
    resetTokenExpiration: Date,
    // Thêm các trường khác nếu cần
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
