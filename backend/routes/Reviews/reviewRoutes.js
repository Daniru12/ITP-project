import express from "express";
import {
  addReview,
  getAllReviews,
  getServiceReviews,
  getAverageRating,
  updateReview,
  deleteReview,
} from "../../controller/Reviews_and_Ratings/reviewController.js";

import { protect } from "../../middleware/authMiddleware.js";


const reviewRouter = express.Router();


reviewRouter.post("/create", protect, addReview); // Add a review
reviewRouter.get("/service", getAllReviews); // Get all reviews for a service
reviewRouter.get("/service/:serviceId", getServiceReviews);
reviewRouter.get("/average/:serviceId", getAverageRating);
reviewRouter.put("/update/:reviewId", protect, updateReview); // Update a review
reviewRouter.delete("/delete/:reviewId",deleteReview); // Delete a review

export default reviewRouter;
