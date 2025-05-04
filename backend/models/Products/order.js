import mongoose from "mongoose";
import PromoCode from "./PromoCode.js";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: 1
        },
        price: {
          type: Number,
          required: [true, "Price is required"]
        }
      }
    ],
    total_price: {
      type: Number,
      required: [true, "Total price is required"],
    },
    order_status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    pet_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: [true, "petowner is required"],
    },
    shipping_details: {
      receiverName: { type: String, required: [true, "Receiver's name is required"] },
      phoneNumber: { type: String, required: [true, "Phone number is required"] },
      address: { type: String, required: [true, "Shipping address is required"] },
      city: { type: String, required: [true, "City is required"] },
      postalCode: { type: String, required: [true, "Postal code is required"] },
      country: { type: String, required: [true, "Country is required"] },
    },
    promo_code_applied: {
      type: String,
      default: null
    },
    discount_amount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true } //it will automatically create fields for when the order was created and updated
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
