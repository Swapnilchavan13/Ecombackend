const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  merchantid: String,
  producttype: String,
  productname: String,
  productimage: String,
  productprice: String,
  productdiscount: String,
  productquantity: String,
});

const Productdata = mongoose.model('Productdata', dataSchema);

module.exports = Productdata;