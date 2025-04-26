import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment reference is required"],
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: "User", // Links to the User model
      required: [true, "Owner ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    payment_method: {
      type: String,
      enum: ["Cash", "Card"],
      required: [true, "Payment method is required"],
    },
    card_details: {
      card_number: {
        type: String,
        required: function () {
          return this.payment_method === "Card";
        },
      },
      card_holder_name: {
        type: String,
        required: function () {
          return this.payment_method === "Card";
        },
      },
      expiration_date: {
        type: String,
        required: function () {
          return this.payment_method === "Card";
        },
      },
      cvv: {
        type: String,
        required: function () {
          return this.payment_method === "Card";
        },
      },
    },
  },
  {
    timestamps: true,
  }
);


const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
