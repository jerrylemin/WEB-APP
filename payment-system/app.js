// payment-system/app.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Initialize Express app
const app = express();

const helmet = require('helmet');

// Thêm vào app.js sau các middleware khác
app.use(helmet());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Payment-System MongoDB Connected'))
.catch(err => console.log('Payment-System MongoDB Connection Error:', err));

// Routes
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);

// Error handling
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint không tồn tại' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Lỗi server' });
});

// Start server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Payment-System Server started on port ${PORT}`);
});
