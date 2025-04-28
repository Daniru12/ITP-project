import mongoose from "mongoose";

// Define the PetBook Entry Schema
const petBookEntrySchema = new mongoose.Schema(
  {
    pet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet", // Reference to the Pet model
      required: [true, "Pet ID is required"],
    },
    title: {
      type: String,
      required: [true, "Entry title is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Health", "Activity", "Diet", "Milestone", "Note"], // Different types of entries
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    metrics: {
      weight: Number,  // Optional weight tracking
      mood: String,    // Optional mood tracking
      activity_duration: Number, // Optional activity duration in minutes
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create the PetBook model
const PetBook = mongoose.model("PetBook", petBookEntrySchema);

export default PetBook; 