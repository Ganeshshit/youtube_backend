import mongoose from "mongoose";
import dotenv from 'dotenv'
import { DB_NAME } from "../constants.js";

const connectDB = async (MONGO_URI) => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGO_URI}`
    );
    console.log(
      `Mongo db Connected DB HOST ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(error);
    console.log("Mongo db connection Failed")
    
    process.exit(1);
  }
};

export default connectDB;
