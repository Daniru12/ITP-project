import express from "express";

import { 
    createGroomingScheduling, 
    getAllGroomingSchedulings, 
    getGroomingSchedulingById, 
    updateGroomingSheduling, 
    deleteGroomingScheduling 
} from "../../controller/Booking_Scheduling/groomingController.js";

import {
    createTrainingSchedule,
  getAllSchedules,
  getScheduleById,
  updateTrainingSession,
  deleteTrainingSession,
  getScheduleByAppointmentId
} from "../../controller/Booking_Scheduling/trainingController.js";

import {
    createScheduling,
    getAllSchedulings,
    getSchedulingById,
    updateScheduling,
    deleteScheduling,
    toggleConfirmedDay 
  } from "../../controller/Booking_Scheduling/boardingController.js";

const router = express.Router(); 

import { protect } from "../../middleware/authMiddleware.js";




router.post("/groomingschedule/create",protect, createGroomingScheduling);            // Schedule a grooming appointment
router.get("/groomingschedule",protect, getAllGroomingSchedulings);            // View all grooming appointments
router.get("/groomingschedule/:id", getGroomingSchedulingById);       // View a specific appointment
router.put("/groomingschedule/update/:id",protect, updateGroomingSheduling);          // Update an appointment
router.delete("/groomingschedule/delete/:id",protect, deleteGroomingScheduling);   


//Training Scheduling Routes
router.post('/trainingschedule/create',protect, createTrainingSchedule);
router.get('/trainingschedule', getAllSchedules);
router.get('/trainingschedule/:id',protect, getScheduleById);
router.put('/trainingschedule/update/:id',protect, updateTrainingSession);
router.delete('/trainingschedule/delete/:id', protect,deleteTrainingSession);






// All boarding schedule routes are protected
router.post("/bordingschedule/create", protect, createScheduling); // Create new boarding schedule
router.get("/bordingschedule", protect, getAllSchedulings);       // Get all boarding schedules
router.get("/bordingschedule/:id", protect, getSchedulingById);    // Get single schedule by ID
router.put("/bordingschedule/update/:id", protect, updateScheduling);     // Update a schedule by ID
router.delete("/bordingschedule/delete/:id", protect, deleteScheduling);  // Delete a schedule by ID
router.patch("/bordingschedule/toggle/:scheduleId", toggleConfirmedDay);


export default router; 
