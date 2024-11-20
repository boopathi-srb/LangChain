import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DB, {
      maxPoolSize: 20,
      maxIdleTimeMS: 30000,
    });
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw new Error("Could not connect to database!!");
  }
}

export async function closeDataBase() {
  try {
    console.log("Connection to database closed");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error closing the database:", error);
    throw new Error("Could not close database!!");
  }
}
