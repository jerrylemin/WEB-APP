// models/accountModel.js

const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    accountID: {
        type: String,
        required: true,
        default: null
    },
    balance: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Account', AccountSchema);
