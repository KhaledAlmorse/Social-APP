import mongoose from "mongoose";

const DB_Connection= async()=>{
    await mongoose
    .connect(process.env.DB_URL)
    .then(()=>{console.log(`DataBase Connected Successfully..`);})
    .catch((err)=>{console.log(`Falied To Connect DB ,Error: ${err.message}`);})
}

export default DB_Connection;