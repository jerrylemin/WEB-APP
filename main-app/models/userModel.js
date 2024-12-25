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
        default: null
    },
    address: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null  
    },
    isAdmin: {
        type: Boolean,
        default: false 
    },
    googleAuth: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiration: Date,
    bankAccountID: {
        type: String,
        default: null   
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true 
    }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = {
    User,
    Admin
};