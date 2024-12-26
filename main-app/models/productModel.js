// models/productModel.js

const mongoose = require('mongoose');

// const ReviewSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     name: String,
//     rating: Number,
//     comment: String,
//     createdAt: { type: Date, default: Date.now }
// });

// const ProductSchema = new mongoose.Schema({
//     // Các trường khác...
//     reviews: [ReviewSchema],
//     rating: {
//         type: Number,
//         default: 0
//     },
//     numReviews: {
//         type: Number,
//         default: 0
//     }
// });

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
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category' 
    },
    stock: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: 'images/webPageResources/bg/bobacup.png'
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
