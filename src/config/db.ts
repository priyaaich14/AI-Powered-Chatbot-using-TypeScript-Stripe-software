import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Loads environment variables from the .env file

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected successfully to chatbot');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Exit process if MongoDB connection fails
  }
};

export default connectDB;
