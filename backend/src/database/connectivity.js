import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const dbURI = 'mongodb+srv://admin:123@eventify.dkeujvr.mongodb.net/ZeroTrace?retryWrites=true&w=majority&appName=eventify';
    await mongoose.connect(dbURI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

export default connectDB;
