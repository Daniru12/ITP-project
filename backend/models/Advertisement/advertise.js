import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    advertiser_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Advertiser reference is required"],
    },
    title: {
      type: String,
      required: [true, "Advertisement title is required"],
    },
    description: {
      type: String,
      required: [true, "Advertisement description is required"],
    },
    category: {
      type: String,
      enum: ["Service", "Product", "Rescue Pet"],
      required: [true, "Advertisement category is required"],
    },
    image_url: {
      type: String,
      required: [true, "Advertisement image is required"],
    },
    start_date: {
      type: Date,
      required: [true, "Start date is required"],
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Default status is pending
    },
  },
  {
    timestamps: true,
  }
);

const Advertisement = mongoose.model("Advertisement", advertisementSchema);

export default Advertisement;