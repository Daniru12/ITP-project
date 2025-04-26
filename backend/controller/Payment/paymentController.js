import Payment from "../../models/Payment/payment.js";
import Appointment from "../../models/BookingScheduling/Appointment.js";
import bcrypt from "bcryptjs";


export const createPayment = async (req, res) => {
  try {
    const { appointment_id, amount, currency, payment_method, card_details } = req.body;

    // Validate appointment
    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Use the authenticated user's ID directly
    const owner_id = req.user._id;

    // // Validate that the authenticated user is the owner of the appointment
    // if (!appointment.user_id.equals(owner_id)) {
    //   return res.status(403).json({ message: "You are not authorized to pay for this appointment" });
    // }

    // Validate card details if payment method is "Card"
    if (
      payment_method === "Card" &&
      (!card_details || !card_details.card_number || !card_details.card_holder_name || !card_details.expiration_date || !card_details.cvv)
    ) {
      return res.status(400).json({ message: "Card details are required for card payments" });
    }

    // Hash CVV if payment method is Card
    let hashedCardDetails = null;
    if (payment_method === "Card" && card_details) {
      const salt = await bcrypt.genSalt(10);
      const hashedCVV = await bcrypt.hash(card_details.cvv, salt);
      
      hashedCardDetails = {
        ...card_details,
        cvv: hashedCVV
      };
    }

    // Create new payment
    const newPayment = new Payment({
      appointment_id,
      owner_id, // Set owner_id from the authenticated user
      amount,
      currency: currency || "USD",
      payment_method,
      card_details: hashedCardDetails,
    });

    // Save payment
    await newPayment.save();
    res.status(201).json({ message: "Payment created successfully", payment: newPayment });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("appointment_id");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("appointment_id");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update payment status
export const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Payment updated successfully", payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
