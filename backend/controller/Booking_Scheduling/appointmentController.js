// controllers/appointmentController.js

import Appointment from "../../models/BookingScheduling/Appointment.js";
import Pet from "../../models/Pets.js";
import GroomingService from "../../models/Service.js";
import User from "../../models/User.js";
import { calculateLoyaltyPoints, calculateDiscount } from "../../utils/loyaltyHelper.js";

// Book a new appointment
export const bookAppointment = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.body.pet_id, owner_id: req.user._id });
    if (!pet) return res.status(403).json({ message: "Pet not found or not owned by user" });

    const usePoints = req.body.usePoints === true;
    let discount = 0;

    if (usePoints) {
      const user = await User.findById(req.user._id);
      discount = calculateDiscount(user.loyalty_points);
      if (discount > 0) {
        user.loyalty_points = 0;
        await user.save();
      }
    }

    const newAppointment = new Appointment({
      ...req.body,
      status: "pending",
      discount_applied: discount,
      package_type: req.body.package_type,
    });

    await newAppointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
      discountApplied: discount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error: error.message });
  }
};

// Get user's appointments
export const getUserAppointments = async (req, res) => {
  try {
    const pets = await Pet.find({ owner_id: req.user._id });
    const petIds = pets.map((pet) => pet._id);

    const appointments = await Appointment.find({ pet_id: { $in: petIds } })
      .populate("pet_id")
      .populate({
        path: "service_id",
        populate: { path: "provider_id", select: "username full_name" },
      });

    res.status(200).json(
      appointments.length === 0
        ? { message: "No appointments found for this user", appointments: [] }
        : appointments
    );
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// Get service provider's appointments
export const getProviderAppointments = async (req, res) => {
  try {
    if (req.user.user_type !== "service_provider") {
      return res.status(403).json({ message: "Only service providers can access this feature" });
    }

    const providerServices = await GroomingService.find({ provider_id: req.user._id });
    const serviceIds = providerServices.map((service) => service._id);

    const appointments = await Appointment.find({ service_id: { $in: serviceIds } })
      .populate({
        path: "pet_id",
        populate: { path: "owner_id", select: "full_name phone_number" },
      })
      .populate({ path: "service_id", select: "service_name service_category" })
      .sort({ appointment_date: 1 });

    res.status(200).json(
      appointments.length === 0
        ? { message: "You don't have any appointments yet", appointments: [] }
        : { message: "Successfully found your appointments!", appointments }
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
};

// Confirm or reject appointment by provider
export const updateAppointmentStatus = async (req, res) => {
  try {
    // Ensure only service providers can update appointment status
    if (req.user.user_type !== "service_provider") {
      return res.status(403).json({ message: "Only service providers can update appointment status" });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status to ensure it is one of the allowed values
    if (!status || !["confirmed", "rejected", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'confirmed', 'rejected', 'cancelled', or 'completed'" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const service = await GroomingService.findById(appointment.service_id);
    if (service.provider_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to appointment" });
    }

    // Update appointment status
    appointment.status = status;
    await appointment.save();

    // If the appointment is confirmed, award loyalty points to the pet owner
    if (status === "confirmed") {
      const pet = await Pet.findById(appointment.pet_id);
      const petOwner = await User.findById(pet.owner_id);
      const pointsEarned = calculateLoyaltyPoints(appointment.package_type);
      petOwner.loyalty_points += pointsEarned;
      await petOwner.save();

      return res.status(200).json({
        message: "Appointment confirmed successfully",
        appointment,
        pointsEarned,
        totalPoints: petOwner.loyalty_points,
      });
    }

    // If status is not 'confirmed', simply return a success message
    res.status(200).json({
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update appointment", error: error.message });
  }
};

// Get a single appointment by ID (provider view)
export const getSingleProviderAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.user_type !== "service_provider") {
      return res.status(403).json({ message: "Only service providers can access this appointment" });
    }

    const appointment = await Appointment.findById(id)
      .populate("pet_id")
      .populate({ path: "service_id", select: "service_name price duration provider_id" });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.service_id?.provider_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this appointment" });
    }

    res.status(200).json({ message: "Appointment fetched successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointment", error: error.message });
  }
};

// Get a single appointment by ID (user view)
export const getSingleUserAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("pet_id")
      .populate({ path: "service_id", select: "service_name price duration" });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.pet_id.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to appointment" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointment", error: error.message });
  }
};

// Update appointment (user-side)
export const updateUserAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updates = req.body;

    const appointment = await Appointment.findById(appointmentId).populate("pet_id");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.pet_id.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own appointments" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Only pending appointments can be updated" });
    }

    const allowedFields = ["appointment_date", "package_type", "special_notes", "service_id"];
    for (let key of allowedFields) {
      if (updates[key] !== undefined) {
        appointment[key] = updates[key];
      }
    }

    await appointment.save();

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error: error.message });
  }
};

// Delete appointment (user-side)
export const deleteUserAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId).populate("pet_id");

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.pet_id.owner_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own appointments" });
    }

    if (["completed"].includes(appointment.status)) {
      return res.status(400).json({ message: `You cannot delete a ${appointment.status} appointment` });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error: error.message });
  }
};

// Delete appointment (provider-side)
export const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    if (req.user.user_type !== "service_provider") {
      return res.status(403).json({ message: "You need to be a service provider to delete appointments" });
    }

    const appointment = await Appointment.findById(appointmentId).populate({
      path: "service_id",
      select: "provider_id service_name",
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.service_id.provider_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This appointment doesn't belong to your services" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "You can't delete completed appointments" });
    }

    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment", error: error.message });
  }
};

// Cancel appointment (user or provider)
export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: "pet_id",
        populate: { path: "owner_id", select: "_id full_name" },
      })
      .populate({
        path: "service_id",
        populate: { path: "provider_id", select: "_id full_name" },
      });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const userId = req.user._id.toString();
    const isPetOwner = appointment.pet_id?.owner_id?._id.toString() === userId;
    const isServiceProvider = appointment.service_id?.provider_id?._id.toString() === userId;

    if (!isPetOwner && !isServiceProvider) {
      return res.status(403).json({ message: "You are not authorized to cancel this appointment" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed appointment" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "This appointment is already cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling appointment", error: error.message });
  }
};