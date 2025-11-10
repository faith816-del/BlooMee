const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

// ====== Serve static files ======
app.use(express.static(path.join(__dirname, 'public')));

// ====== Import routes ======
const authRoutes = require('./routes/auth');
const periodRoutes = require('./routes/periodRoutes');
const doctorAiRoutes = require("./routes/doctor-ai");
const doctorBookingRoute = require("./routes/doctor-booking");
const productRoutes = require('./routes/product');
const onboardingRoutes = require("./routes/onboarding");
const passport = require("./middleware/passportSetup");
const ordersRoutes = require('./routes/orders');
const ngoRoutes = require('./routes/ngo');

// Initialize passport before any routes using it
app.use(passport.initialize());

app.use('/api/periods', periodRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/doctor-ai", doctorAiRoutes);
app.use("/api/book-session", doctorBookingRoute);
app.use('/api/products', productRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/ngo', ngoRoutes);

// ✅ Use Gemini AI route (corrected name)
const aiBuddyRoutes = require('./routes/ai-buddy');
app.use('/api/ai-buddy', aiBuddyRoutes);

// ====== Connect to MongoDB ======
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Missing MONGO_URI in environment');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ====== Default test route ======
app.get('/', (req, res) => res.send('Backend running with Gemini AI! 🌸'));

// ====== Footer link routes ======
const footerPages = [
  'about-us', 'where-to-buy', 'coins-program', 'contact',
  'warranty', 'shipping', 'returns', 'privacy',
  'shopping-guide', 'track-order', 'product-authentication'
];

footerPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `public/pages/${page}.html`));
  });
});

// ====== 404 handler ======
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ====== Centralized error handler ======
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ====== Start server ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));