// middleware/cartMiddleware.js

function initializeCart(req, res, next) {
    if (!req.session.cart) {
        req.session.cart = {
            items: [],
            totalPrice: 0
        };
    }
    next();
}

module.exports = initializeCart;
