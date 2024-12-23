// app.js

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const crypto = require('crypto');

const app = express();

// Kết nối Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Khởi động server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Payment System Server is running on port ${PORT}`);
});
