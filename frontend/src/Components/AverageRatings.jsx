import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const AverageRating = ({ serviceId }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/reviews/average/${serviceId}`
        );
        setRatingData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Error loading ratings");
        toast.error(error.response?.data?.message || "Error loading ratings");
      } finally {
        setLoading(false);
      }
    };

    fetchAverageRating();
  }, [serviceId, backendUrl]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }

    if (decimalPart >= 0.5) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="text-center mt-8">
        <div className="spinner"></div>
        <p>Loading ratings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500">
        <p>Oops! Something went wrong while loading the ratings.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ratingData || ratingData.averageRating === undefined) {
    return <div className="text-center mt-8 text-red-500">Failed to load rating data.</div>;
  }

  const rating = Number(ratingData.averageRating) || 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Service Rating Overview</h2>

      {rating === 0 ? (
        <p className="text-center text-gray-500">No ratings available for this service yet</p>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="flex justify-center items-center gap-1 mb-2">
              {renderStars(rating)}
            </div>
            <p className="text-xl font-semibold">{rating} out of 5</p>
            <p className="text-gray-600">({ratingData.totalReviews} reviews)</p>
          </div>

          
        </div>
      )}
    </div>
  );
};

export default AverageRating;
