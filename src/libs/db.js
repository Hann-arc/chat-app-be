import mongoose from "mongoose";

export const connectDB = async() => {
    try {
       await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log("Monggo db error connect ", error);
  }
}