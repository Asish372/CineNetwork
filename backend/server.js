const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security Headers
app.use(cors());
app.use(express.json());

// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/auth', authLimiter);

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});
app.get('/', (req, res) => {
  res.send('API is running...');
});

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: true }); // Sync models with database
    console.log('Database synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
