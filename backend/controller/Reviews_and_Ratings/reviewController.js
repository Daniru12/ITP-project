import mongoose from "mongoose";
import Review from "../../models/Reviews/review.js";
import Service from "../../models/Service.js";

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { service, rating, review } = req.body;
    const userId = req.user._id;

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if the service exists
    const existingService = await Service.findById(service);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Create and save new review
    const newReview = new Review({
      user: userId,
      service,
      rating,
      review,
    });

    await newReview.save();

    // Update service's review count
    await Service.findByIdAndUpdate(
      service,
      { $inc: { reviewCount: 1 } },
      { new: true }
    );

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Review creation error:", error);
    res.status(500).json({ message: "Error adding review", error: error.message });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "full_name")
      .populate("service", "service_name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// Get reviews for a specific service
export const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const reviews = await Review.find({ service: serviceId })
      .populate("user", "full_name")
      .populate("service", "service_name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching service reviews:", error);
    res.status(500).json({ message: "Error fetching service reviews", error: error.message });
  }
};

// Get average rating for a service
export const getAverageRating = async (req, res) => {
  try {
    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ message: "Invalid service ID format" });
    }

    const result = await Review.aggregate([
      {
        $match: { 
          service: new mongoose.Types.ObjectId(serviceId),
          rating: { $exists: true, $gte: 1, $lte: 5 }
        }
      },
      {
        $group: {
          _id: "$service",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const responseData = result.length > 0 ? {
      serviceId,
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews
    } : {
      serviceId,
      averageRating: 0,
      totalReviews: 0
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.status(500).json({ 
      message: "Error calculating average rating",
      error: error.message
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (existingReview.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const updateFields = {
      ...(rating && { rating }),
      ...(review && { review }),
      updatedAt: Date.now()
    };

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateFields,
      { new: true }
    );

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.user_type;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== userId.toString() && 
        !["admin", "service_provider"].includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await review.deleteOne();

    // Update service's review count
    await Service.findByIdAndUpdate(
      review.service,
      { $inc: { reviewCount: -1 } },
      { new: true }
    );

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};