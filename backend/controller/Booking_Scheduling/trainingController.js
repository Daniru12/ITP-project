// controllers/trainingScheduleController.js
import TrainingSchedule from '../../models/BookingScheduling/TrainingSchedule.js';




export const createTrainingSchedule = async (req, res) => {
  try {
    

    const {
      appointment_id,
      pet_id,
      service_id,
      week_start_date,
      schedule,
    } = req.body;

    // Basic validation (before passing to Mongoose)
    if (!appointment_id || !pet_id || !service_id || !week_start_date || !schedule || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid schedule format",
      });
    }

    const newSchedule = new TrainingSchedule({
      appointment_id,
      pet_id,
      service_id,
      week_start_date,
      schedule,
      comments: req.body.comments || "", // Optional
    });

    await newSchedule.save();

    res.status(201).json({
      success: true,
      message: "Training schedule created successfully",
      data: newSchedule,
    });

  } catch (err) {
   

    // If it's a Mongoose validation error, return 400 instead of 500
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};



// controllers/trainingScheduleController.js

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await TrainingSchedule.find()
      .populate({
        path: 'appointment_id',
        populate: {
          path: 'pet_id service_id', // deeply populate if needed
        }
      })
      .populate('pet_id')
      .populate('service_id');

    res.status(200).json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getScheduleById = async (req, res) => {
  try {
    const schedule = await TrainingSchedule.findById(req.params.id)
      .populate('appointment_id')
      .populate('pet_id')
      .populate('service_id');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.status(200).json({ success: true, data: schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getScheduleByAppointmentId = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const schedule = await TrainingSchedule.findOne({ appointment_id: appointmentId })
      .populate({
        path: 'appointment_id',
        populate: {
          path: 'pet_id service_id',
        },
      })
      .populate('pet_id')
      .populate('service_id');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.status(200).json({ success: true, schedule });
  } catch (error) {
    console.error('Error fetching training schedule:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/scheduling/trainingschedule/:id/session
// Update a specific session in the training schedule
export const updateTrainingSession = async (req, res) => {
  try {
    const { id } = req.params; // Training Schedule ID
    const { day, sessionIndex, sessionData } = req.body; // Day, Session Index, and the session data

    // Find the schedule by ID
    const schedule = await TrainingSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Training schedule not found' });
    }

    // Find the day object that matches the requested day
    const dayObj = schedule.schedule.find(d => d.day === day);
    if (!dayObj) {
      return res.status(400).json({ message: 'Invalid day provided' });
    }

    // Check if the sessionIndex is valid
    if (sessionIndex < 0 || sessionIndex >= dayObj.sessions.length) {
      return res.status(400).json({ message: 'Invalid session index' });
    }

    // Update the session with the provided data
    dayObj.sessions[sessionIndex] = { ...dayObj.sessions[sessionIndex], ...sessionData };

    // Save the updated schedule
    await schedule.save();

    res.status(200).json({ message: 'Session updated successfully', updatedSession: dayObj.sessions[sessionIndex] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


// DELETE /api/scheduling/trainingschedule/:id/session
export const deleteTrainingSession = async (req, res) => {
  try {
    const { id } = req.params; // schedule document ID
    const { day, sessionIndex } = req.body;

    const schedule = await TrainingSchedule.findById(id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const dayObj = schedule.schedule.find(d => d.day === day);
    if (!dayObj || sessionIndex < 0 || sessionIndex >= dayObj.sessions.length) {
      return res.status(400).json({ message: 'Session not found for given day and index' });
    }

    // Remove the session
    dayObj.sessions.splice(sessionIndex, 1);

    await schedule.save();
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
