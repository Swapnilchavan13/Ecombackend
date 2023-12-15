const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    businessName: String,
    businessType: String,
    loaction: String,
    businessAddress: String,
    businessPhone: String,
    businessEmail: String,
    ownerName: String,
    ownerPhone: String,
    password: String,
})

const Merchantdata= mongoose.model('Merchantdata', dataSchema);

module.exports = Merchantdata