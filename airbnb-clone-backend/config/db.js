const mongoose = require('mongoose');

// Connects to MongoDB using the URI from environment variables.
// Keeping this in its own module keeps server.js clean and makes
// the connection logic reusable (e.g. from the seed script).
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
