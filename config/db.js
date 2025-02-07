import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Function to connect to the MongoDB database
export const connectDB = () => {
  // Set the strictQuery option to false
  mongoose.set("strictQuery", false);

  // Connect to MongoDB using the connection string from environment variables
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB is connected");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1); // Exit with a non-zero status code to indicate failure
    });
};
