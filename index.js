const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3005;


const Productdata = require('./models/productdata')

// MongoDB Connection
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(cors({ origin: '*' }));

// Simple get request
app.get('/', (req, res) => {
  res.send('Hello Ecom Admin');
});

// Adding Products to the Site
app.post('/addproduct', async (req, res) => {
    const {producttype, productname, productimage, productprice, productdiscount, productquantity} = req.body;

    try{
        const newData = new Productdata({
            producttype,
            productname,
            productimage,
            productprice,
            productdiscount,
            productquantity
        })
        await newData.save()
        console.log("Product Data Saved.")
        res.status(200).json({message: "Product Data Saved"})
    } catch(err) {
        console.error("Error Saving Data", err)
    }
});

//To Get All Data

app.get('/allproducts', async (req, res) => {
  try {
    const allProducts = await Productdata.find();
    res.status(200).json(allProducts);
  } catch (err) {
    console.error('Error Fetching Data', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Delete The Product


app.delete('/deleteproduct/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const deletedProduct = await Productdata.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error Deleting Product', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});