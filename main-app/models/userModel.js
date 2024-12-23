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
    APIKey: {
        type: String,
        default: null
    },
    resetToken: String,
    resetTokenExpiration: Date,
    bankAccountID: {
        type: String,
        default: null   
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
