import Review from "../../models/Reviews/review.js";
import User from "../../models/User.js";
import Service from "../../models/Service.js";

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { service, rating, review } = req.body;
    const userId = req.user._id;

    // Check if the service exists
    const existingService = await Service.findById(service);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Create a new review
    const newReview = new Review({
      user: userId,
      service,
      rating,
      review,
    });

    await newReview.save();

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Review creation error:", error);
    res.status(500).json({ message: "Error adding review", error: error.message });
  }
};

// ✅ Get all reviews

// ✅ Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "full_name") // 👈 must match your user schema field name
      .populate("service", "service_name");

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};


// ✅ Get reviews for a specific service
export const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.find({ service: serviceId })
      .populate("user", "name")
      .populate("service", "name");

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching service reviews:", error);
    res.status(500).json({ message: "Error fetching service reviews", error: error.message });
  }
};


// Get average rating for a service ✅
export const getAverageRating = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Validate the serviceId parameter
    if (!serviceId) {
      return res.status(400).json({
        message: "Service ID is required"
      });
    }

    console.log("Service ID:", serviceId); // Log the serviceId for debugging

    // Aggregation query to calculate average rating
    const result = await Review.aggregate([
      {
        $match: { service: new mongoose.Types.ObjectId(serviceId) }
      },
      {
        $group: {
          _id: "$service",
          averageRating: { $avg: "$rating" }, // Calculates average rating
          totalReviews: { $sum: 1 } // Counts total number of reviews
        }
      }
    ]);

    console.log("Aggregation Result:", result); // Log the aggregation result for debugging

    if (result.length === 0) {
      return res.status(404).json({
        message: "No reviews found for this service",
        averageRating: 0,
        totalReviews: 0
      });
    }

    // Safely access averageRating and totalReviews
    const { averageRating, totalReviews } = result[0];

    res.status(200).json({
      serviceId,
      averageRating: averageRating ? averageRating.toFixed(1) : 0, // Ensure fixed decimal
      totalReviews
    });
  } catch (error) {
    console.error("Error fetching average rating:", error); // Log the error for debugging
    res.status(500).json({ 
      message: "Error calculating average rating",
      error: error.message
    });
  }
};




// ✅ Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // Find the review
    const existingReview = await Review.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user is the owner of the review
    if (existingReview.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only update your own reviews" });
    }

    // Update fields
    existingReview.rating = rating || existingReview.rating;
    existingReview.review = review || existingReview.review;
    existingReview.updatedAt = Date.now();

    await existingReview.save();

    res.status(200).json({
      message: "Review updated successfully",
      review: existingReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
};

// ✅ Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.user_type;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Allow only review owner or Admin/Service Provider to delete
    if (review.user.toString() !== userId.toString() && userRole !== "admin" && userRole !== "service_provider") {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};

