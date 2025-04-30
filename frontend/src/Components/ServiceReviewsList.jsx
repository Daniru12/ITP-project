import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ServiceReviewsList = () => {
  const { serviceId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchServiceReviews = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/reviews/service/${serviceId}`
        );
        setReviews(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceReviews();
  }, [serviceId, backendUrl]);

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  if (loading) return <div className="text-center p-4">Loading reviews...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center">
            No reviews available for this service yet.
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div 
                key={review._id} 
                className={`border-b pb-6 last:border-b-0 ${
                  review.rating < 2 ? 'bg-red-50' : 
                  review.rating > 3 ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {review.user?.full_name || "Anonymous User"}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-yellow-500 text-xl">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600 ml-2">
                      ({review.rating}/5)
                    </span>
                  </div>
                </div>
                <p className="text-gray-700">{review.review}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceReviewsList;