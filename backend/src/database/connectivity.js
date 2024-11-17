import mongoose from 'mongoose';

const connectDB = async ()=>{
 try{                                        //change it 
    const mongoURI=process.env.MONGO_URI || 'mongodb+srv://admin:123@eventify.dkeujvr.mongodb.net/ZeroTrace?retryWrites=true&w=majority&appName=eventify';
    console.log("ok")
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected...');
} catch (error) {
     console.error('Error connecting to MongoDB:', error.message);
     process.exit(1); 
}
};
export default connectDB; 