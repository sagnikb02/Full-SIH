// config/db.js
//const mongoose = require('mongoose');

//async function connectDB() {
 // try {
//    await mongoose.connect(process.env.MONGO_URI, {
      // optional: mongoose 7+ doesn't need these, but safe to leave out options
 //   });
 //   console.log('✅ Connected to MongoDB');
//  } catch (err) {
 ///   console.error('❌ MongoDB connection error:', err.message);
  //  process.exit(1);
  //}
//}



const mongoose = require("mongoose");

const connectDB = async () => {
    console.log("🔍 Trying to connect to MongoDB...");

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected → ${conn.connection.host}`);
        console.log(`📂 Using Database → ${conn.connection.name}`);
    } catch (error) {
        console.error("❌ MongoDB Connection FAILED\n", error);
        process.exit(1);
    }
};

module.exports = connectDB;







