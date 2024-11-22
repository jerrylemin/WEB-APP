// models/postModel.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    // Thêm các trường khác nếu cần
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
