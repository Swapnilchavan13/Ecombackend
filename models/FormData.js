const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    appSection: String,
    productCategory: String,
    brand: String,
    title: String,
    offerHeadline: String,
    description: String,
    excerptDescription: String,
    photo: String,
    videoLink: String,
    photo2: String,
    price: String,
    discountedPrice: String
});

const FormData = mongoose.model('FormData', dataSchema);

module.exports = FormData;
