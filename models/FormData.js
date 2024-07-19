const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    appSection: { type: String, required: true },
    productCategory: { type: String, required: true },
    brand: { type: String, required: true },
    brandImage: { type: String },  // New field for brand image
    title: { type: String, required: true },
    offerHeadline: { type: String, required: true },
    description: { type: String, required: true },
    excerptDescription: { type: String, required: true },
    photo: { type: String },  // Field for first photo
    videoLink: { type: String },
    photo2: { type: String },  // Field for second photo
    additionalPhoto1: { type: String },  // Field for additional photo 1
    additionalPhoto2: { type: String },  // Field for additional photo 2
    price: { type: String, required: true },
    discountedPrice: { type: String }
});

const FormData = mongoose.model('FormData', dataSchema);

module.exports = FormData;
