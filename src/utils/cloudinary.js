import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //file system

cloudinary.config({
  cloud_name: "dhqwyqekj",
  api_key: "919286656546572",
  api_secret: "cGERZ4IMNS6P8sttwM1VFn49_Zg",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    // Upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File hasbeen uploaded Success fully
    console.log("File uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //Remove the localy saved temporary file as the upload operation got faild
    return null;
  }
};

export {uploadOnCloudinary}