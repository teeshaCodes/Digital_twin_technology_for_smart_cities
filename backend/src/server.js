require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const apiRoutes = require('./routes/api');
const dataPoller = require('./services/dataPoller');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes mount
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    database: db.isMongoConnected() ? 'mongodb' : 'local-json-files',
    timestamp: new Date()
  });
});

// Initialize database connection and start application server
const startServer = async () => {
  // Connect to DB (will check MONGODB_URI, falls back if offline)
  await db.connectDB();

  // Start Express listener
  const server = app.listen(PORT, () => {
    console.log(`🚀 UrbanPulse Backend Server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
  });

  // Start polling Scheduler (defaults to every 60 seconds)
  const pollingInterval = parseInt(process.env.POLLING_INTERVAL) || 60000;
  dataPoller.startPoller(pollingInterval);

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n🛑 Shutdown signal received. Cleaning up processes...');
    dataPoller.stopPoller();
    server.close(() => {
      console.log('💤 Express server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
