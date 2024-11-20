import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    // Use environment variable or fallback to default URI
    const mongoURI =
      process.env.MONGO_URI ||
      'mongodb+srv://admin:123@eventify.dkeujvr.mongodb.net/ZeroTrace?retryWrites=true&w=majority&appName=eventify';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
