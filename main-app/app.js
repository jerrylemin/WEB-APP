require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Import Passport Config
require('./config/passport')(passport); 

// Import routes
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Sử dụng express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout'); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 
// Session configuration
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 ngày
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
    res.locals.title = 'Your Default Title'; // Đặt tiêu đề mặc định
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', homeRoutes); // Home page
app.use('/', authRoutes); // Authentication
app.use('/products', productRoutes);
app.use('/cart', cartRoutes); 
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes); // Admin page
app.use('/', userRoutes);

// Error handling routes
const errorController = require('./controllers/errorController');
app.use(require('./routes/errorRoutes'));
app.use(errorController.get404);
app.use(errorController.get500);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Main-App Server started on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
