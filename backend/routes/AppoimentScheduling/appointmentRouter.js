import express from "express";
import {
  bookAppointment,
  getUserAppointments,
  getProviderAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  cancelAppointment,
  deleteUserAppointment,
  updateUserAppointment,
  getSingleUserAppointment,
  getSingleProviderAppointment,
} from "../../controller/Booking_Scheduling/appointmentController.js";
import { protect } from "../../middleware/authMiddleware.js";

const appointmentRouter = express.Router();

// All appointment routes are protected
appointmentRouter.post("/create", protect, bookAppointment);
appointmentRouter.get("/user", protect, getUserAppointments);
appointmentRouter.get("/user/:id", protect, getSingleUserAppointment);
appointmentRouter.get("/appointments/provider/:id", protect, getSingleProviderAppointment);
appointmentRouter.get("/provider", protect, getProviderAppointments);
appointmentRouter.delete("/user/:id", protect, deleteUserAppointment);
appointmentRouter.put("/user/:id", protect, updateUserAppointment);


// New routes for managing appointments
appointmentRouter.put("/:id", protect, updateAppointmentStatus); // ✅ Add this!
appointmentRouter.delete("/:id", protect, deleteAppointment);
appointmentRouter.patch("/:id/cancel", protect, cancelAppointment);
appointmentRouter.patch("/:id/status", protect, updateAppointmentStatus); // Optional/legacy
export default appointmentRouter;
