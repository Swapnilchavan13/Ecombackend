// orderModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    productName: String,
    quantity: Number,
    price: Number,
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Userdata' },
    products: [productSchema],
    address: String,
    paymentMethod: String,
    total: Number,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
