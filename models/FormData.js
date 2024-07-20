const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    username: { type: String, required: true },
    appSection: { type: String, required: true },
    productCategory: { type: String, required: true },
    brand: { type: String, required: true },
    brandImage: { type: String },
    title: { type: String, required: true },
    offerHeadline: { type: String, required: true },
    description: { type: String, required: true },
    excerptDescription: { type: String, required: true },
    photo: { type: String },
    videoLink: { type: String },
    photo2: { type: String },
    additionalPhoto1: { type: String },
    additionalPhoto2: { type: String },
    price: { type: String, required: true },
    discountedPrice: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const FormData = mongoose.model('FormData', dataSchema);

module.exports = FormData;
