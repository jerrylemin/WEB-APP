// config/db.js
require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payment-system', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for Payment System');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
