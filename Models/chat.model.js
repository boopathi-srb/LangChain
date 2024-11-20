import mongoose from "mongoose";

// Define Mongoose schema
const chatSchema = new mongoose.Schema(
  {
    chats: {
      type: [{ human: String, bot: String }],
    },
  },
  { timestamps: true }
);

// Create the model
const chatModel = mongoose.model("chats", chatSchema);

export default chatModel;
