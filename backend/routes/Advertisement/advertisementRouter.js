
import express from "express";
import {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  approveAdvertisement,
  rejectAdvertisement,
  getApprovedAdvertisements,
} from "../../controller/Advertisement/advertisementController.js"; // Adjust path as needed

import { protect } from "../../middleware/authMiddleware.js";

const Advertiserouter = express.Router();


Advertiserouter.post("/create",protect, createAdvertisement);// Create a new advertisement
Advertiserouter.get("/", getAdvertisements);// Get all advertisements
Advertiserouter.get("/approved", getApprovedAdvertisements);// Get only approved advertisements
Advertiserouter.get("/:id",protect, getAdvertisementById);// Get a single advertisement by ID
Advertiserouter.put("/update/:id",protect, updateAdvertisement);// Update an advertisement
Advertiserouter.delete("/delete/:id",protect, deleteAdvertisement);// Delete an advertisement
Advertiserouter.put("/approve/:id",protect, approveAdvertisement);// Approve an advertisement
Advertiserouter.put("/reject/:id",protect, rejectAdvertisement);// Reject an advertisement

export default Advertiserouter;
