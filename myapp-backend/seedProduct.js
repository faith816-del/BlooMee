const mongoose = require('mongoose');
const Product = require('./models/produt'); // <-- adjust if your model file name differs
require('dotenv').config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch(err => console.error(err));

// List all products
const products = [
  { name: "Sanitary Towels", image: "/assets/towels.jpeg", price: 200, category: "Sanitary" },
  { name: "Tampons", image: "/assets/tampons.jpeg", price: 250, category: "Sanitary" },
  { name: "Wipes", image: "/assets/wipes.jpeg", price: 150, category: "Sanitary" },
  { name: "Liners", image: "/assets/liners.jpeg", price: 100, category: "Sanitary" },
  { name: "Body Scrub", image: "/assets/scrub.jpeg", price: 400, category: "Body Care" },
  { name: "Deodorant", image: "/assets/deodorant.jpeg", price: 300, category: "Body Care" },
  { name: "Gillette", image: "/assets/gillette.jpeg", price: 500, category: "Body Care" },
  // add all other products here...
];

// Insert products into DB
const seedDB = async () => {
  await Product.deleteMany({}); // optional: clears previous data
  await Product.insertMany(products);
  console.log("Products seeded!");
  mongoose.connection.close();
};

seedDB();
module.exports = router;