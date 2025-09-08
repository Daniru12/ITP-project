import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    image: {
      type: [String], 
      default: [], // Default image
    },
    serviceProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "Service provider is required"],
    },
    promo_code_applied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true // Add timestamps
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;