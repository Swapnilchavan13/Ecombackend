const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  merchantid: String,
  producttype: String,
  productname: String,
  productimage: String,
  productprice: String,
  productdiscount: String,
  productquantity: String,
  productdescription: String,
  productdeliveryDate: Number,
  productoffer: String,
  productblock: Boolean,


  image_one: String,
  image_two: String,
  image_three: String,
  image_four: String,
  image_five: String,
  video_one: String,
  video_two: String,
  // Additional fields for specific product types
  brand: String, // for Electronics
  storage: String, // for Electronics
  operatingSystem: String, // for Electronics
  cellularTechnology: String, // for Electronics
  size: String, // for Clothing and Shoes
  color: String, // for Clothing, Cosmetics, Shoes
  material: String, // for Clothing, Furniture
  // Add more fields as needed
});

const Productdata = mongoose.model('Productdata', dataSchema);

module.exports = Productdata;
