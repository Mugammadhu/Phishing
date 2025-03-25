const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connectDatabase() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("database connected successfully");
    })
    .catch(() => {
      console.log("database connection issue");
    });
}

module.exports = connectDatabase;
