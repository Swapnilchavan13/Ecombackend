const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const https = require('http');

const fs = require('fs'); // Import fs module with promises support


const request = require('request');

const app = express();
const port = 3080;
const multer = require('multer');
const path = require('path');

const Productdata = require("./models/productdata");
const Userdata = require("./models/User");
const Order = require("./models/Order");
const Merchantdata = require("./models/Merchant");
const UploadedFilePath = require("./models/Pdf")

const FormData = require('./models/FormData');// MongoDB Connection


mongoose.set("strictQuery", false);

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

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: "*" }));
app.use('/uploads', express.static('uploads'));



//Researcher data//

app.post('/submit', upload.fields([{ name: 'photo' }, { name: 'photo2' }]), async (req, res) => {
  try {
    const formData = new FormData({
      appSection: req.body.appSection,
      productCategory: req.body.productCategory,
      brand: req.body.brand,
      title: req.body.title,
      offerHeadline: req.body.offerHeadline,
      description: req.body.description,
      excerptDescription: req.body.excerptDescription,
      photo: req.files.photo ? req.files.photo[0].path : '',
      videoLink: req.body.videoLink,
      photo2: req.files.photo2 ? req.files.photo2[0].path : '',
      price: req.body.price,
      discountedPrice: req.body.discountedPrice
    });

    await formData.save();
    res.status(200).json({ message: 'Form data saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving form data', error: err });
  }
});

// GET request to fetch all form data
app.get('/formdata', async (req, res) => {
  try {
    const formData = await FormData.find();
    res.status(200).json(formData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching form data', error: err });
  }
});

///////





/////

const folderPath = 'D:/1Play'; // Change this to the path of your video folder

app.get('/videos', (req, res) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return res.status(500).json({ error: 'Error reading folder' });
    }

    // Filter out non-video files
    const videoFiles = files.filter(file => file.endsWith('.mp4'));

    // Generate URLs for the video files
    const videoURLs = videoFiles.map(file => `${req.protocol}://${req.get('host')}/videos/${encodeURIComponent(file)}`);

    res.json({ videos: videoURLs });
  });
});

// Serve video files
app.get('/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(folderPath, filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing video file:', err);
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Set response headers for streaming video
    res.setHeader('Content-Type', 'video/mp4');

    // Send the video file
    res.sendFile(filePath);
  });
});

//////


app.get('/videoSize', async (req, res) => {
  try {
    const filePath = req.query.filePath; // Retrieve file path from query parameter
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required.' });
    }

    const stats = await fs.stat(filePath); // Get file stats including size
    const sizeInBytes = stats.size; // Get size of the file in bytes
    const sizeInMB = sizeInBytes; // Convert bytes to megabytes
    res.json({ size: sizeInMB });
  } catch (error) {
    console.error('Error fetching file size:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found.' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

/////////////////otp////////////////////////
app.post("/send-otp", (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
      return res.status(400).json({ error: "Mobile number is required." });
  }

  const options = {
      method: "POST",
      hostname: "control.msg91.com",
      path: `/api/v5/otp?template_id=6669404cd6fc0565025c2102&mobile=${mobileNumber}&authkey=408994AbeVcmRYV66682d3bP1`,
      headers: {
          "Content-Type": "application/JSON",
      }
  };

  const request = https.request(options, function (response) {
      const chunks = [];

      response.on("data", function (chunk) {
          chunks.push(chunk);
      });

      response.on("end", function () {
          const body = Buffer.concat(chunks);
          if (response.statusCode === 200) {
              console.log("OTP sent successfully");
              res.status(200).json({ message: "OTP sent successfully" });
          } else {
              console.error("Failed to send OTP");
              res.status(response.statusCode).json({ error: "Failed to send OTP" });
          }
      });
  });

  request.on("error", function (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  });

  request.end();
});


//////verify otp/////

app.post("/verify-otp", (req, res) => {
  const { otp, mobileNumber } = req.body;
  if (!otp || !mobileNumber) {
      return res.status(400).json({ error: "OTP and mobile number are required." });
  }

  const options = {
      method: "GET",
      hostname: "control.msg91.com",
      path: `/api/v5/otp/verify?otp=${otp}&mobile=${mobileNumber}`,
      headers: {
          "authkey": "408994AbeVcmRYV66682d3bP1"
      }
  };

  const request = https.request(options, function (response) {
      const chunks = [];

      response.on("data", function (chunk) {
          chunks.push(chunk);
      });

      response.on("end", function () {
          const body = Buffer.concat(chunks);
          console.log(body.toString()); // This would be the response from the OTP verification service
          res.status(response.statusCode).send(body); // Send the response from the OTP verification service back to the client
      });
  });

  request.on("error", function (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
  });

  request.end();
});

/////////////////////////////////////

// Simple get request
app.get("/", (req, res) => {
  res.send("Hello Ecom Admin");
});

// Registerd Uaer Data
app.post("/userdata", async (req, res) => {
  const { username, usernumber, userpassword, useraddress, userorder } =
    req.body;

  try {
    // Check if the user already exists based on username and mobile number
    const existingUser = await Userdata.findOne({ username, usernumber });

    if (existingUser) {
      // If the user exists, update the address
      userorder, (existingUser.useraddress = useraddress);
      await existingUser.save();
      console.log("User Address Updated");
      res.status(200).json({ message: "User Address Updated" });
    } else {
      // If the user doesn't exist, create a new entry
      const newData = new Userdata({
        username,
        usernumber,
        userpassword,
        useraddress,
      });
      await newData.save();
            res.status(200).json({ message: "New User Data saved" });
    }
    // Update User Address Data
  } catch (err) {
    console.error("Error Saving/Updating User Data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
console.log("New User Data Saved");

//Patch request
app.patch("/userdata/:id", async (req, res) => {
  const userId = req.params.id;
  const { useraddress } = req.body;

  try {
    // Find the user by ID
    const existingUser = await Userdata.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update the user's address
    existingUser.useraddress = useraddress;
    await existingUser.save();
    console.log("User Address Updated");
    res.status(200).json({ message: "User Address Updated" });
  } catch (err) {
    console.error("Error Updating User Address", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Assuming your existing code to fetch all user data looks like this
app.get("/userdata", async (req, res) => {
  try {
    const userData = await Userdata.find();
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/allusers", async (req, res) => {
  try {
    const allusers = await Userdata.find();
    res.status(200).json(allusers);
  } catch (err) {
    console.error("Error Fetching Data", err);
    res.status(500).json({ message: "Internam Server Error" });
  }
});

// Adding Products to the Site
app.post("/addproduct", async (req, res) => {
  const {
    merchantid,
    producttype,
    productname,
    productimage,
    productprice,
    productdiscount,
    productquantity,
    productdescription,
    productdeliveryDate,
    productoffer,
    productblock,

    image_one,
    image_two,
    image_three,
    image_four,
    image_five,
    video_one,
    video_two,
    brand,
    storage,
    operatingSystem,
    cellularTechnology,
    size,
    color,
    material,
  } = req.body;

  try {
    const newData = new Productdata({
      merchantid,
      producttype,
      productname,
      productimage,
      productdiscount,
      productquantity,
      productdescription,
      productdeliveryDate,
      productoffer,
      productblock,
      image_one,
      image_two,
      image_three,
      productprice,
      color,
      image_four,
      image_five,
      video_one,
      video_two,
      brand,
      storage,
      operatingSystem,
      cellularTechnology,
      size,
      material,
    });
    await newData.save();
    console.log("Product Data Saved.");
    res.status(200).json({ message: "Product Data Saved" });
  } catch (err) {
    console.error("Error Saving Data", err);
  }
});

//To Get All Data
app.get("/allproducts", async (req, res) => {
  try {
    const allProducts = await Productdata.find();
    res.status(200).json(allProducts);
  } catch (err) {
    console.error("Error Fetching Data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To Get Data for a Specific Merchant
app.get("/allproducts/:merchantid", async (req, res) => {
  const merchantId = req.params.merchantid;

  try {
    if (!merchantId) {
      // If merchantId is not provided in the params, return an error
      return res
        .status(400)
        .json({ error: "Merchant ID is required in the URL parameters" });
    }

    // Find products only for the specified merchant ID
    const merchantProducts = await Productdata.find({ merchantid: merchantId });

    if (merchantProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for the specified merchant ID" });
    }

    res.status(200).json(merchantProducts);
  } catch (err) {
    console.error("Error Fetching Data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Delete The Product
app.delete("/deleteproduct/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const deletedProduct = await Productdata.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error Deleting Product", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User orders
app.post("/createorder", async (req, res) => {
  const { userId, orderdate, products, address, paymentMethod, total, status } =
    req.body;

  try {
    // Create a new order using the Order model
    const newOrder = new Order({
      userId,
      products,
      orderdate,
      address,
      paymentMethod,
      total,
      status,
    });

    // Save the new order to the database
    await newOrder.save();

    console.log("Order created successfully");
    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    console.error("Error creating order", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all orders
app.get("/allorders", async (req, res) => {
  try {
    // Fetch all orders from the database
    const allOrders = await Order.find();
    res.status(200).json(allOrders);
  } catch (err) {
    console.error("Error fetching orders", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete order by _id
app.delete("/allorders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // Find the order by _id and delete it
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single order by ID
app.get("/allorders/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  // Return the order details

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Patch request to update order status
app.patch("/updateorderstatus/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
    // Find the order by ID
    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order's status
    existingOrder.status = status;
    await existingOrder.save();

    console.log("Order Status Updated");
    res.status(200).json({ message: "Order Status Updated" });
  } catch (err) {
    console.error("Error Updating Order Status", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

///Merchnt data///
app.post("/merchantdata", async (req, res) => {
  const {
    businessName,
    businessType,
    loaction,
    businessAddress,
    businessPhone,
    businessEmail,
    ownerName,
    ownerPhone,
    password,
  } = req.body;

  try {
    // Check if the email or phone number already exists in the database
    const existingMerchant = await Merchantdata.findOne({
      $or: [{ businessEmail: businessEmail }, { businessPhone: businessPhone }],
    });

    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        errorMessage: "Email or phone number already in use",
      });
    }

    const newMerchant = new Merchantdata({
      businessName,
      businessType,
      loaction,
      businessAddress,
      businessPhone,
      businessEmail,
      ownerName,
      ownerPhone,
      password,
    });

    // Save the new merchant to the database
    await newMerchant.save();

    console.log("New Merchant Data saved");
    res.status(200).json({ success: true, message: "New Merchant Data Saved" });
  } catch (err) {
    console.error("Error creating order", err);
    res
      .status(500)
      .json({ success: false, errorMessage: "Internal Server Error" });
  }
});

app.get("/allmerchants", async (req, res) => {
  try {
    const allMerchants = await Merchantdata.find();
    res.status(200).json(allMerchants);
  } catch (err) {
    console.log("error fetching merchant", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New route for handling merchant deletion
app.delete("/allmerchants/:id", async (req, res) => {
  const merchantId = req.params.id;

  try {
    const deletedMerchant = await Merchantdata.findByIdAndDelete(merchantId);

    if (deletedMerchant) {
      res.json({ success: true, message: "Merchant deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Merchant not found" });
    }
  } catch (error) {
    console.error("Error deleting merchant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single Merchant by ID
app.get("/allmerchants/:merchantId", async (req, res) => {
  const merchantId = req.params.merchantId;
  // Return the Merchant details

  try {
    // Find the Merchant by ID
    const merchant = await Merchantdata.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    res.status(200).json(merchant);
  } catch (error) {
    console.error("Error fetching merchant details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To Get Data for a Specific Merchant
app.get("/allproducts/:merchantid", async (req, res) => {
  const merchantId = req.params.merchantid;

  try {
    if (!merchantId) {
      // If merchantId is not provided in the params, return an error
      return res
        .status(400)
        .json({ error: "Merchant ID is required in the URL parameters" });
    }

    // Find products only for the specified merchant ID
    const merchantProducts = await Productdata.find({ merchantid: merchantId });

    if (merchantProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for the specified merchant ID" });
    }

    res.status(200).json(merchantProducts);
  } catch (err) {
    console.error("Error Fetching Data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New route for handling merchant deletion
app.delete("/allmerchants/:id", async (req, res) => {
  const merchantId = req.params.id;

  try {
    const deletedMerchant = await Merchantdata.findByIdAndDelete(merchantId);

    if (deletedMerchant) {
      res.json({ success: true, message: "Merchant deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Merchant not found" });
    }
  } catch (error) {
    console.error("Error deleting merchant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get single Merchant by ID
app.get("/allmerchants/:merchantId", async (req, res) => {
  const merchantId = req.params.merchantId;
  // Return the Merchant details

  try {
    // Find the Merchant by ID
    const merchant = await Merchantdata.findById(merchantId);

    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }
    res.status(200).json(merchant);
  } catch (error) {
    console.error("Error fetching merchant details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to update the 'productblock' field of a product
app.patch("/updateproductblock/:productId", async (req, res) => {
  const productId = req.params.productId;
  const { productblock } = req.body;

  try {
    // Find the product by its ID
    const product = await Productdata.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Update the 'productblock' field
    product.productblock = productblock;
    await product.save();

    console.log("Product block status updated");
    res.status(200).json({ message: "Product block status updated" });
  } catch (err) {
    console.error("Error updating product block status", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});
