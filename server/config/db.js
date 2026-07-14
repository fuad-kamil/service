const mongoose = require('mongoose');
const mockMongoose = require('../utils/mongooseMock');

// Immediately apply mock if we are in local/offline development to prevent buffering issues
const isLocalOrOffline = !process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost') || process.env.MONGO_URI.includes('127.0.0.1');

if (isLocalOrOffline) {
  console.log('Local/Offline environment detected. Activating Mock JSON Database...');
  Object.assign(mongoose, mockMongoose);
}

const connectDB = async () => {
  if (isLocalOrOffline) {
    await mongoose.connect();
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Failed to connect to Mongo Atlas. Falling back to Mock JSON Database...`);
    Object.assign(mongoose, mockMongoose);
    await mongoose.connect();
  }
};

module.exports = connectDB;
