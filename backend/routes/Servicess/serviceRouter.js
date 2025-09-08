import express from "express";
import {
  addService,
  getProviderServices,
  getServicesByCategory,
  updateService
} from "../../controller/Servicess/serviceController.js";
import { protect } from "../../middleware/authMiddleware.js";

const groomingRouter = express.Router();

// Public routes
groomingRouter.get("/category/:category", getServicesByCategory);

// Protected routes
groomingRouter.post("/service", protect, addService);
groomingRouter.get("/provider", protect, getProviderServices);
groomingRouter.put("/service/:id", protect, updateService);

export default groomingRouter;