// config/database.js
const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * This function handles the database connection separately from server.js
 * This makes our code more modular and easier to test
 */
const connectDB = async () => {
  try {
    // Get connection string from environment variables or use default
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/adichat',
      {
        // MongoDB connection options for better performance and compatibility
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Listen to MongoDB connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;