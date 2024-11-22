// models/productModel.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: String,
    stock: {
        type: Number,
        default: 0
    },
    // Thêm các trường khác nếu cần
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
