import mongoose from "mongoose";

// Define a schema for package tiers
const packageTierSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["basic", "premium", "luxury"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  duration: {
    type: Number,
    required: true,
    min: [15, "Duration must be at least 15 minutes"],
  },
  includes: [
    {
      type: String,
      required: true,
    },
  ],
});

const groomingServiceSchema = new mongoose.Schema(
  {
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Service provider is required"],
    },
    service_name: {
      type: String,
      required: [true, "Service name is required"],
    },
    service_category: {
      type: String,
      required: [true, "Service category is required"],
      enum: ["pet_grooming", "pet_boarding", "pet_training"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    packages: {
      basic: packageTierSchema,
      premium: packageTierSchema,
      luxury: packageTierSchema,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    image: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const GroomingService = mongoose.model(
  "Services",
  groomingServiceSchema
);

export default GroomingService;
