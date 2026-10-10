import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config(); // Load environment variables from .env file

// Optional: override DNS servers (fixes SRV lookup failures for mongodb+srv:// on some networks)
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(','));
}

const connectDB = async () => {
  try {
    // Use environment variable or fallback to default URI
    const mongoURI = process.env.MONGO_URI 
    
    await mongoose.connect(mongoURI, {
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
