import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ReviewsList = ({ serviceId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews/service/${serviceId}`
        );
        setReviews(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [serviceId]);

  const renderStars = (rating, size = "text-lg") => {
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    const emptyStars = 5 - fullStars - (decimalPart >= 0.5 ? 1 : 0);
    let stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className={`${size} text-yellow-500`} />);
    }

    // Add half star if needed
    if (decimalPart >= 0.5) {
      stars.push(<FaStarHalfAlt key="half" className={`${size} text-yellow-500`} />);
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className={`${size} text-gray-300`} />);
    }

    return stars;
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p>No reviews available for this service yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{review.user?.full_name || "Anonymous"}</h4>
                    <p className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-yellow-500">
                    {renderStars(review.rating, "text-lg")}
                    <span className="text-sm text-gray-600 ml-2">({review.rating}/5)</span>
                  </div>
                </div>
                <p>{review.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
