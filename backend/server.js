// server.js

// ========== Load Environment Variables FIRST ==========
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// ========== Import Packages ==========
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startSchedulers } = require('./services/scheduler'); 

// ========== Initialize Express App ==========
const app = express();

// ========== Connect Database ==========
// Connect to DB and then start schedulers
connectDB().then(() => {
  console.log('⏰ Starting Schedulers...');
  startSchedulers();
});

// ========== Middleware ==========
// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mednexus-hospital-management.vercel.app',
    'https://mednexus-hospital-management-*.vercel.app' // For preview deployments
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== Test Route ==========
app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 Hospital Service API is running!',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      hospitals: '/api/hospitals',
      laboratories: '/api/labs',
      tests: '/api/tests',
      users: '/api/users',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      admin: '/api/admin',
      contacts: '/api/contacts',
      compare: '/api/compare',
      favorites: '/api/favorites',
      owner: '/api/owner',
      appointments: '/api/appointments',
      searchHistory: '/api/search-history',
      locations: '/api/locations'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ========== Import Routes ==========
const hospitalRoutes = require('./routes/hospitalRoutes');
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const labRoutes = require('./routes/labRoutes'); 
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const searchHistoryRoutes = require('./routes/searchHistoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// ========== API Routes ==========
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/submissions', submissionRoutes);

// ========== 404 Handler ==========
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ========== Error Handler ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📚 Available Routes:`);
  console.log(`   GET    http://localhost:${PORT}/api/hospitals`);
  console.log(`   GET    http://localhost:${PORT}/api/tests`);
  console.log(`   POST   http://localhost:${PORT}/api/users/register`);
  console.log(`   POST   http://localhost:${PORT}/api/users/login`);
  console.log(`✅ Ready to accept requests!\n`);
});