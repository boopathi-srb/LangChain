import mongoose from "mongoose";
import { z } from "zod";

// Define a Zod schema for validation
const memoryZodSchema = z.object({
  memory: z.string().min(1, { message: "Memory cannot be empty" }), // Validating memory as non-empty string
  date: z.date().optional(), // Optional date field; you can make this required if needed
});

// Define Mongoose schema
const memorySchema = new mongoose.Schema(
  {
    memory: String,
    date: Date,
  },
  { timestamps: true }
);

// Pre-save validation using Zod
memorySchema.pre("save", function (next) {
  const memoryData = {
    memory: this.memory,
    date: this.date,
  };

  const result = memoryZodSchema.safeParse(memoryData); // Validate data using Zod

  if (!result.success) {
    const errorMessage = result.error.errors
      .map((err) => err.message)
      .join(", ");
    return next(new Error(errorMessage)); // Pass validation errors to Mongoose's next
  }

  next(); // Proceed with save if validation passes
});

// Create the model
const memoryModel = mongoose.model("memories", memorySchema);

export default memoryModel;
