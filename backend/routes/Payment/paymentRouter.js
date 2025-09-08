import express from "express";
import {
  createPayment,
  getPaymentById,
  getAllPayments,
  updatePayment,
  deletePayment,
} from "../../controller/Payment/paymentController.js";

import { protect } from "../../middleware/authMiddleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/create", protect, createPayment); // Create a new payment
paymentRouter.get("/:id", protect, getPaymentById); // Get payment by ID
paymentRouter.get("/", protect, getAllPayments); // Get all payments
paymentRouter.put("/update/:id", protect, updatePayment); // Update payment status
paymentRouter.delete("/delete/:id", protect, deletePayment); // Delete a payment


export default paymentRouter;

