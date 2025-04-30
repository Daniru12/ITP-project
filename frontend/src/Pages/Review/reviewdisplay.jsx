import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AllReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/reviews/service`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err.response?.data || err.message);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [backendUrl, token]);

  // Custom star rendering with the Sandy Gold color
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span 
          key={i} 
          style={{
            color: i < rating ? '#DFA55D' : '#E2E2E2',
            fontSize: '1.2rem',
            marginRight: '2px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen"
        style={{ backgroundColor: '#F9F6F2' }}
      >
        <div 
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{ 
            borderColor: '#BC4626',
            borderTopColor: 'transparent' 
          }}
        ></div>
        <p 
          className="mt-4 text-xl font-medium"
          style={{ color: '#BC4626' }}
        >
          Loading reviews...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
        style={{ backgroundColor: '#F9F6F2' }}
      >
        <div 
          className="p-6 rounded-lg shadow-lg bg-white max-w-md"
          style={{ borderTop: '4px solid #BC4626' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="#BC4626">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-bold" style={{ color: '#BC4626' }}>{error}</p>
          <p className="mt-2 text-gray-600">Please try again later or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg shadow-md text-white transition-all duration-200"
            style={{ backgroundColor: '#347486' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: '#F9F6F2',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="52" height="26" viewBox="0 0 52 26" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23bc4626" fill-opacity="0.05"%3E%3Cpath d="M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z" /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div 
          className="bg-white shadow-xl rounded-xl overflow-hidden"
          style={{
            boxShadow: '0 10px 25px rgba(188, 70, 38, 0.15), 0 5px 10px rgba(52, 116, 134, 0.1)'
          }}
        >
          <div 
            className="py-6 px-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #BC4626 0%, #DFA55D 100%)',
              borderBottom: '4px solid #347486'
            }}
          >
            <h2 
              className="text-2xl font-bold text-white flex items-center justify-center"
              style={{
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Service Reviews
            </h2>
          </div>
          <div className="p-8">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="#DFA55D">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-500">No reviews available yet.</p>
                <p className="text-gray-400 mt-2">Be the first to leave a review!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <li key={review._id} className="py-6 flex flex-col sm:flex-row justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center mb-2">
                        <div 
                          className="flex mr-2" 
                          title={`${review.rating} out of 5 stars`}
                        >
                          {renderStars(review.rating)}
                        </div>
                        <span 
                          className="text-sm font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: review.rating >= 4 ? 'rgba(52, 116, 134, 0.1)' : 'rgba(188, 70, 38, 0.1)',
                            color: review.rating >= 4 ? '#347486' : '#BC4626'
                          }}
                        >
                          {review.rating}/5
                        </span>
                      </div>
                      <p 
                        className="font-medium mb-2"
                        style={{ color: '#333' }}
                      >
                        "{review.review}"
                      </p>
                      <div className="flex flex-wrap items-center text-sm">
                        <div 
                          className="flex items-center mr-4"
                          style={{ color: '#BC4626' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">{review.user?.full_name || "Anonymous"}</span>
                        </div>
                        <div 
                          className="flex items-center mr-4"
                          style={{ color: '#347486' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{review.service?.service_name || "Unknown Service"}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center">
                      <Link 
                        to={`/review/${review._id}`}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(223, 165, 93, 0.1)',
                          color: '#DFA55D',
                          border: '1px solid rgba(223, 165, 93, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(223, 165, 93, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(223, 165, 93, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate(`/reviews/${reviews[0]?.service?._id}`)}
                className="inline-flex items-center px-6 py-3 rounded-lg shadow-md text-white font-medium transition-all duration-200 transform hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(to right, #BC4626, #DFA55D)',
                  boxShadow: '0 4px 10px rgba(188, 70, 38, 0.25)'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Submit Another Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllReviews;