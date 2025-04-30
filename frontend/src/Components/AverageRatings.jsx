import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const AverageRating = ({ serviceId, compact = false }) => {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/reviews/average/${serviceId}`
        );
        setRatingData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Error loading ratings");
        console.error("Error loading ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAverageRating();
  }, [serviceId, backendUrl]);

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

  if (loading) {
    return compact ? (
      <div className="flex items-center text-sm text-gray-500">
        <span className="animate-pulse">Loading...</span>
      </div>
    ) : (
      <div className="flex justify-center items-center p-4">
        <div className="w-6 h-6 border-2 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="ml-2">Loading ratings...</span>
      </div>
    );
  }

  if (error) {
    return compact ? (
      <div className="text-sm text-red-500">Error loading rating</div>
    ) : (
      <div className="p-4 text-red-500 text-center">
        <p>Failed to load ratings</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ratingData || ratingData.averageRating === undefined) {
    return compact ? (
      <div className="text-sm text-red-500">No data available</div>
    ) : (
      <div className="p-4 text-gray-500 text-center">No rating data available</div>
    );
  }

  const rating = Number(ratingData.averageRating) || 0;
  const reviewCount = ratingData.totalReviews || 0;

  // Compact version for use in the left corner of other components
  if (compact) {
    return (
      <div className="flex items-center space-x-1 min-w-max">
        <div className="flex">{renderStars(rating, "text-sm")}</div>
        <span className="text-sm font-medium whitespace-nowrap">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      </div>
    );
  }

  // Full version with more details
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row sm:items-center w-full max-w-3xl">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className="flex mr-2">{renderStars(rating)}</div>
          <span className="font-bold text-lg">                       {rating.toFixed(1)}</span>
        </div>
        <p className="text-gray-600 text-sm">Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
      </div>
      
      {reviewCount > 0 && (
        <div className="mt-3 sm:mt-0">
          
        </div>
      )}
    </div>
  );
};

export default AverageRating;