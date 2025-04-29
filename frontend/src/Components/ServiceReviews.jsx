import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";

const ServiceReviews = () => {
  const { serviceId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchServiceReviews = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/reviews/service/${serviceId}`
        );
        setReviews(response.data);
        calculateAverage(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceReviews();
  }, [serviceId, backendUrl]);

  const calculateAverage = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating((total / reviews.length).toFixed(1));
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  const generateReport = () => {
    const badReviews = reviews.filter(review => review.rating < 2);
    const goodReviews = reviews.filter(review => review.rating > 3);

    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");

    // Title
    doc.setFontSize(16);
    doc.text("Service Review Report", 14, 20);

    // Average Rating
    doc.setFontSize(12);
    doc.text(`Average Rating: ${averageRating}`, 14, 30);
    doc.text(`Total Reviews: ${reviews.length}`, 14, 35);
    doc.text(`Good Reviews (4-5 stars): ${goodReviews.length}`, 14, 40);
    doc.text(`Bad Reviews (1-2 stars): ${badReviews.length}`, 14, 45);

    // Bad Reviews
    doc.text("Bad Reviews:", 14, 55);
    badReviews.forEach((review, index) => {
      doc.text(`ID: ${review._id}`, 14, 60 + (index * 15));
      doc.text(`Rating: ${review.rating}`, 14, 65 + (index * 15));
      doc.text(`Review: ${review.review}`, 14, 70 + (index * 15));
      doc.text(`Date: ${new Date(review.createdAt).toLocaleDateString()}`, 14, 75 + (index * 15));
    });

    // Good Reviews
    doc.text("Good Reviews:", 14, 80 + (badReviews.length * 15));
    goodReviews.forEach((review, index) => {
      doc.text(`ID: ${review._id}`, 14, 85 + (badReviews.length * 15) + (index * 15));
      doc.text(`Rating: ${review.rating}`, 14, 90 + (badReviews.length * 15) + (index * 15));
      doc.text(`Review: ${review.review}`, 14, 95 + (badReviews.length * 15) + (index * 15));
      doc.text(`Date: ${new Date(review.createdAt).toLocaleDateString()}`, 14, 100 + (badReviews.length * 15) + (index * 15));
    });

    // Save the PDF
    doc.save(`service-${serviceId}-report.pdf`);
  };

  if (loading) return <div className="text-center p-4">Loading reviews...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Generate Report
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold">
            Average Rating: {averageRating}/5
          </h3>
          <p className="text-gray-600">
            Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>

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

export default ServiceReviews;
