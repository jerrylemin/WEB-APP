// models/categoryModel.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    // Thêm các trường khác nếu cần
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
