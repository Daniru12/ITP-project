import express from "express";
import petBookController from "../controller/petBookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Route to create a new petbook entry
router.post("/", petBookController.createEntry);

// Route to get all entries for a specific pet
router.get("/pet/:pet_id", petBookController.getEntriesByPet);

// Route to update a specific entry
router.put("/:id", petBookController.updateEntry);

// Route to delete a specific entry
router.delete("/:id", petBookController.deleteEntry);

export default router; 