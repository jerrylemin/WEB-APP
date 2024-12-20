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
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false 
    },
    resetToken: String,
    resetTokenExpiration: Date,
    balance: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
