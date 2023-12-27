const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 3008;

const Productdata = require("./models/productdata");
const Userdata = require("./models/User");
const Order = require("./models/Order");
const Merchantdata = require("./models/Merchant");

// MongoDB Connection
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({ origin: "*" }));

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
      console.log("New User Data Saved");
      res.status(200).json({ message: "New User Data saved" });
    }
    // Update User Address Data
  } catch (err) {
    console.error("Error Saving/Updating User Data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
    brand,
    storage,
    operatingSystem,
    cellularTechnology,
    size,
    color,
    material
    
  } = req.body;

  try {
    const newData = new Productdata({
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
      brand,
      storage,
      operatingSystem,
      cellularTechnology,
      size,
      color,
      material
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
      return res
        .status(400)
        .json({
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

// Start the Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});
