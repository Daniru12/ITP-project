import Grooming from "../../models/BookingScheduling/GroomingSheduling.js";
import Service from "../../models/Service.js"; // Import Groomer mode
import Pet from "../../models/Pets.js"; // Import Pet model
import Appointment from "../../models/BookingScheduling/Appointment.js"; // Import Appointment model


// Create a new grooming appointment (Scheduling)
// Create a new grooming appointment (Scheduling)
export const createGroomingScheduling = async (req, res) => {
    try {
        const { pet_id, service_id, appointment_id, Period, start_time, special_requests = "", notes = "" } = req.body;

        // Validate required fields
        if (!pet_id || !service_id || !appointment_id || !start_time) {
            return res.status(400).json({ error: "All required fields must be provided!" });
        }

        // Save the grooming scheduling
        const newGrooming = new Grooming({
            pet_id,
            service_id,
            appointment_id,
            Period,
            start_time,
            special_requests,
            notes
        });

        await newGrooming.save();

        res.status(201).json({
            message: "Grooming appointment scheduled successfully!",
            data: newGrooming
        });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Get all grooming schedules (populated)
export const getAllGroomingSchedulings = async (req, res) => {
    try {
      const groomings = await Grooming.find()
        .populate("appointment_id")
        .populate("pet_id")
        .populate("service_id");
  
      // ✅ Return as array (not wrapped in { data: ... })
      res.status(200).json(groomings);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch grooming schedules",
        details: error.message,
      });
    }
  };
  
  
  
// Get a single grooming schedule by ID
export const getGroomingSchedulingById = async (req, res) => {
    try {
        const appointment = await Grooming.findById(req.params.id).populate("pet_id service_id appointment_id");
        if (!appointment) return res.status(404).json({ error: "Grooming Scheduling not found" });

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};


// Update an existing grooming appointment
export const updateGroomingSheduling = async (req, res) => {
    try {
        const { Period, start_time, end_time } = req.body;

        let computedEndTime = end_time ? new Date(end_time) : null;

        // If `start_time` is provided, recalculate `end_time` based on `Period`
        if (start_time) {
            computedEndTime = new Date(start_time);
            switch (Period) {
                case "30min":
                    computedEndTime.setMinutes(computedEndTime.getMinutes() + 30);
                    break;
                case "1hour":
                    computedEndTime.setHours(computedEndTime.getHours() + 1);
                    break;
                case "2hours":
                    computedEndTime.setHours(computedEndTime.getHours() + 2);
                    break;
                default:
                    if (!end_time) {
                        return res.status(400).json({ error: "Custom Period requires an end_time!" });
                    }
                    computedEndTime = new Date(end_time);
                    break;
            }
        }

        const updatedAppointment = await Grooming.findByIdAndUpdate(
            req.params.id,
            { ...req.body, end_time: computedEndTime },
            { new: true, runValidators: true }
        );

        if (!updatedAppointment) return res.status(404).json({ error: "Grooming Scheduling not found" });

        res.status(200).json({ message: "Scheduling updated successfully", data: updatedAppointment });

    } catch (error) {
        res.status(400).json({ error: "Update failed", details: error.message });
    }
};

// Delete a grooming appointment
export const deleteGroomingScheduling = async (req, res) => {
    try {
        const deletedAppointment = await Grooming.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) return res.status(404).json({ error: "Grooming Scheduling not found" });

        res.status(200).json({ message: "Scheduling deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
