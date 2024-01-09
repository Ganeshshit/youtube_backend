import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";
const MONGO_URI='mongodb+srv://ganesh:Ganesh123@cluster0.0zqnw8m.mongodb.net/'
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${MONGO_URI} / ${DB_NAME}`
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
