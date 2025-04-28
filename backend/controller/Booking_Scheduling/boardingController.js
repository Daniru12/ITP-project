import Scheduling from "../../models/BookingScheduling/BoardingSheduling.js";
import Appointment from "../../models/BookingScheduling/Appointment.js";
import { parseISO, isValid, format } from 'date-fns';


// CREATE - Automatically called after confirming an appointment
export const createScheduling = async (req, res) => {
    try {
      const { pet_id, service_id, appointment_id, duration, start_time, end_time } = req.body;
  
      // Basic validation
      if (!pet_id || !service_id || !appointment_id || !start_time) {
        return res.status(400).json({ error: "All fields are required!" });
      }
  
      // Check if appointment exists
      const appointment = await Appointment.findById(appointment_id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      // Prevent duplicate scheduling
      const existing = await Scheduling.findOne({ appointment_id });
      if (existing) {
        return res.status(400).json({ error: "Scheduling already exists for this appointment" });
      }
  
      // Create scheduling
      const newScheduling = new Scheduling({
        pet_id,
        service_id,
        appointment_id,
        duration,
        start_time,
        end_time, // Optional, used only if duration is "custom"
      });
  
      await newScheduling.save();
  
      res.status(201).json({
        message: "Boarding schedule created successfully!",
        data: newScheduling,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  };

// GET ALL SCHEDULINGS
export const getAllSchedulings = async (req, res) => {
  try {
    const schedulings = await Scheduling.find()
      .populate({
        path: "pet_id",
        populate: {
          path: "owner_id",
          select: "full_name phone_number"
        }
    })
      .populate("service_id")
      .populate("appointment_id");

    res.status(200).json(schedulings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch schedulings", details: error.message });
  }
};

// GET SINGLE SCHEDULING BY ID
export const getSchedulingById = async (req, res) => {
  try {
    const scheduling = await Scheduling.findById(req.params.id)
      .populate("pet_id")
      .populate("service_id")
      .populate("appointment_id");

    console.log("Scheduling data:", scheduling);

    if (!scheduling) {
      return res.status(404).json({ error: "Scheduling not found" });
    }

    res.status(200).json(scheduling);
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({ error: "Error retrieving scheduling", details: error.message });
  }
};



// UPDATE SCHEDULING
export const updateScheduling = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate required fields (optional but recommended)
    const requiredFields = ['appointment_id', 'pet_id', 'service_id', 'duration', 'start_time'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // For 'custom' duration, ensure end_time is provided
    if (req.body.duration === 'custom' && !req.body.end_time) {
      return res.status(400).json({ error: 'Custom duration requires an end_time' });
    }

    // Check if the appointment exists before updating
    const appointment = await Appointment.findById(req.body.appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update the document
    const updatedScheduling = await Scheduling.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // ensure Mongoose validation runs
    );

    if (!updatedScheduling) {
      return res.status(404).json({ error: 'Scheduling not found' });
    }

    res.status(200).json({
      message: 'Scheduling updated successfully!',
      data: updatedScheduling,
    });
  } catch (error) {
    console.error('Error updating schedule:', error); // log in backend
    res.status(500).json({
      error: 'Update failed',
      details: error.message,
    });
  }
};


// DELETE SCHEDULING
export const deleteScheduling = async (req, res) => {
  try {
    const deletedScheduling = await Scheduling.findByIdAndDelete(req.params.id);

    if (!deletedScheduling) {
      return res.status(404).json({ error: "Scheduling not found" });
    }

    res.status(200).json({ message: "Scheduling deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed", details: error.message });
  }
};


// TOGGLE CONFIRMATION FOR A SPECIFIC DAY
export const toggleConfirmedDay = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date } = req.body;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Ensure the date is in the correct format (yyyy-MM-dd)
    const parsedDate = parseISO(date); // parse the date to standard format
    if (!isValid(parsedDate)) {
      return res.status(400).json({ error: "Invalid date format, should be yyyy-MM-dd" });
    }

    const formattedDate = format(parsedDate, 'yyyy-MM-dd'); // Format date as yyyy-MM-dd

    // Find the schedule by ID
    const schedule = await Scheduling.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Initialize confirmed_days as an array if it's undefined
    if (!Array.isArray(schedule.confirmed_days)) {
      schedule.confirmed_days = [];
    }

    // Log schedule before update for debugging
    console.log("Schedule before update:", schedule);

    // Toggle the date (add or remove it from confirmed_days)
    if (schedule.confirmed_days.includes(formattedDate)) {
      schedule.confirmed_days = schedule.confirmed_days.filter(d => d !== formattedDate);
    } else {
      schedule.confirmed_days.push(formattedDate);
    }

    // Save the updated schedule
    await schedule.save();

    // Log schedule after update for debugging
    console.log("Schedule after update:", schedule);

    // Respond with success
    res.status(200).json({
      message: "Confirmed days updated",
      confirmed_days: schedule.confirmed_days,
    });
  } catch (error) {
    // Log error details for debugging
    console.error("Error in toggling confirmed day:", error);

    // Return error response
    res.status(500).json({
      error: "Failed to toggle confirmed day",
      details: error.message,
    });
  }
};
