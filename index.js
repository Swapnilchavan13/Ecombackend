const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = 3005;

const Productdata = require("./models/productdata");
const Userdata = require("./models/User");

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

const existingUser = await Userdata.findOne({ username, usernumber });
// Registerd Uaer Data
app.post("/userdata", async (req, res) => {
  const { username, usernumber, userpassword, useraddress, userorder } =
    req.body;

  try {
    // Check if the user already exists based on username and mobile number
    if (existingUser) {
      // If the user exists, update the address
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
        userorder,
      });
      await newData.save();
      console.log("New User Data Saved");
      res.status(200).json({ message: "New User Data saved" });
    }
  } catch (err) {
    console.error("Error Saving/Updating User Data", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Patch request

// Update User Address Data
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

app.get("/userdata", async (req, res) => {
  const { username, usernumber } = req.query;

  try {
    let query = {};

    if (username) {
      query.username = username;
    }

    if (usernumber) {
      query.usernumber = usernumber;
    }

    const userData = await Userdata.find(query);

    // Check if both username and usernumber are provided
    if (username && usernumber && userData.length === 1) {
      res.json(userData[0]); // Return the single matching user
    } else {
      res.status(404).json({ error: "User not found" });
    }
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

// Start the Server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});
