const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Try to connect to local MongoDB
    try {
      await mongoose.connect('mongodb://localhost:27017/test', {
        serverSelectionTimeoutMS: 5000
      });
      console.log('Successfully connected to local MongoDB');
      await mongoose.disconnect();
    } catch (localError) {
      console.error('Failed to connect to local MongoDB:', localError.message);
      
      // Try in-memory MongoDB
      console.log('Testing in-memory MongoDB...');
      try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
        console.log('Successfully connected to in-memory MongoDB');
        await mongoose.disconnect();
        await mongoServer.stop();
      } catch (inMemoryError) {
        console.error('Failed to connect to in-memory MongoDB:', inMemoryError.message);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();
