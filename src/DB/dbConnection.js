import mongoose from "mongoose";

const DB_Connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("DataBase Connected Successfully..");
  } catch (err) {
    console.error("Failed To Connect DB:", err.message);
    process.exit(1);
  }
};

export default DB_Connection;
