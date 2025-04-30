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

  if (loading) return (
    <div className="text-center p-8">
      <div className="inline-flex items-center gap-2 text-gray-600">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        Loading reviews...
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center p-8">
      <div className="inline-flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-0 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">
              Customer Reviews
              <span className="ml-2 text-blue-600 text-xl align-middle">
                ({reviews.length})
              </span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Average Rating: {averageRating}/5</span>
            </div>
          </div>
          
          <button
            onClick={generateReport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Generate Report
          </button>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">No reviews available yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div 
                key={review._id}
                className={`p-6 rounded-xl transition-all duration-200 ${
                  review.rating < 2 ? 'bg-red-50 border-l-4 border-red-400' : 
                  review.rating > 3 ? 'bg-green-50 border-l-4 border-green-400' :
                  'bg-gray-50 border-l-4 border-blue-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {review.user?.full_name?.[0] || "A"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {review.user?.full_name || "Anonymous User"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.review}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xl text-yellow-400">
                      {renderStars(review.rating)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      review.rating < 2 ? 'bg-red-100 text-red-800' :
                      review.rating > 3 ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {review.rating}/5
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceReviews;