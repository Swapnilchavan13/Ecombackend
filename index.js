const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 3005;

const Productdata = require("./models/productdata");
const Userdata = require("./models/User");
const Order = require("./models/Order");

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
      userorder,
      existingUser.useraddress = useraddress;
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
    producttype,
    productname,
    productimage,
    productprice,
    productdiscount,
    productquantity,
  } = req.body;

  try {
    const newData = new Productdata({
      producttype,
      productname,
      productimage,
      productprice,
      productdiscount,
      productquantity,
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

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return the order details
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

// Start the Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});
