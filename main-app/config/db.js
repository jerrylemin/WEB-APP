// config/db.js
require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGO_URI
};
