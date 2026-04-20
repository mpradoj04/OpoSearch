require("dotenv").config();
const mongoose = require("mongoose");
const adminSeeder = require("./seeders/adminSeeder");
 
const runSeeders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
 
    await adminSeeder();
 
    console.log("Seeders completed.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to run seeders:", err.message);
    process.exit(1);
  }
};
 
runSeeders();