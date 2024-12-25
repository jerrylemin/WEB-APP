// models/index.js

module.exports = {
    ...require('./userModel'),
    Product: require('./productModel'),
    Order: require('./orderModel'),
    Cart: require('./cartModel')
};
