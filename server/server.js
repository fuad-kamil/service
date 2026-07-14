require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

const startServer = async () => {
  // Connect DB immediately to configure mocks if needed
  await connectDB();

  // Routes
  const authRoutes = require('./routes/authRoutes');
  const providerRoutes = require('./routes/providerRoutes');
  const serviceRoutes = require('./routes/serviceRoutes');
  const categoryRoutes = require('./routes/categoryRoutes');
  const inquiryRoutes = require('./routes/inquiryRoutes');
  const reviewRoutes = require('./routes/reviewRoutes');
  const userRoutes = require('./routes/userRoutes');
  const uploadRoutes = require('./routes/uploadRoutes');

  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/upload', uploadRoutes);

  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  // 404
  app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

  // Error handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
