import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";

const ServiceReviews = () => {
  const { serviceId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchServiceReviews = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/reviews/service/${serviceId}`
        );
        setReviews(response.data);
        setFilteredReviews(response.data);
        calculateAverage(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceReviews();
  }, [serviceId, backendUrl]);

  useEffect(() => {
    // Apply filters, search, and sort whenever these values change
    let result = [...reviews];
    
    // Apply rating filter
    if (filterRating > 0) {
      result = result.filter(review => review.rating === filterRating);
    }
    
    // Apply search
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(review => 
        review.review.toLowerCase().includes(searchLower) || 
        (review.user?.full_name || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    setFilteredReviews(result);
  }, [reviews, searchTerm, filterRating, sortBy]);

  useEffect(() => {
    // Close modal when clicking outside
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
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

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    
    return distribution;
  };

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  if (loading) return (
    <div className="min-h-screen bg-[#faf7f2] text-center p-8 flex items-center justify-center">
      <div className="inline-flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#DFA55D] border-t-[#BC4626]"></div>
        <span className="text-[#BC4626] font-semibold text-lg">Loading reviews...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#faf7f2] text-center p-8 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg mx-auto border-l-4 border-[#BC4626]">
        <div className="inline-flex items-center gap-3 text-[#BC4626] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold">Error Loading Reviews</h2>
        </div>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 bg-[#BC4626] text-white px-4 py-2 rounded-lg hover:bg-[#a43d22] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Header Section with Statistics */}
        <div className="bg-gradient-to-br from-[#BC4626]/95 to-[#BC4626]/85 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold">Customer Feedback</h1>
              <p className="text-white/80">Get insights from {reviews.length} verified customer reviews</p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-6 w-6 ${star <= Math.round(averageRating) ? 'text-[#DFA55D]' : 'text-white/40'}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-2xl font-bold">{averageRating}</span>
                <span className="text-white/80">out of 5</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Rating Distribution */}
              <div className="col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white/90 text-sm font-medium mb-2">Rating Distribution</h3>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="w-2">{rating}</span>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          rating > 3 ? 'bg-[#347486]' : 
                          rating < 3 ? 'bg-[#BC4626]' : 
                          'bg-[#DFA55D]'
                        }`} 
                        style={{ 
                          width: totalReviews ? `${(distribution[rating - 1] / totalReviews) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs">{distribution[rating - 1]}</span>
                  </div>
                ))}
              </div>
              
              {/* Export Button */}
              <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                <button
                  onClick={generateReport}
                  className="bg-[#347486] hover:bg-[#2a5f6d] text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Export Report
                </button>
                
                <div className="text-center text-white/60 text-xs">
                  Download detailed analysis
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search reviews by content or user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#BC4626] focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-500 mb-1">Filter by Rating</label>
                <select 
                  value={filterRating}
                  onChange={(e) => setFilterRating(parseInt(e.target.value))}
                  className="block w-full rounded-lg border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#BC4626] focus:border-transparent appearance-none pr-10"
                >
                  <option value="0">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-500 mb-1">Sort by</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#BC4626] focus:border-transparent appearance-none pr-10"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Results Stats */}
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredReviews.length} of {reviews.length} reviews
            {(searchTerm || filterRating > 0) && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setFilterRating(0);
                }}
                className="ml-2 text-[#BC4626] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 text-[#DFA55D]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700">No reviews found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {reviews.length === 0 
                  ? "No reviews have been submitted for this service yet."
                  : "No reviews match your current filters. Try adjusting your search or filtering criteria."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <div 
                key={review._id}
                className={`bg-white rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg overflow-hidden cursor-pointer border-t-4 ${
                  review.rating < 2 ? 'border-[#BC4626]' : 
                  review.rating > 3 ? 'border-[#347486]' :
                  'border-[#DFA55D]'
                }`}
                onClick={() => openReviewModal(review)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex gap-3">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        review.rating < 2 ? 'bg-[#BC4626]/10 text-[#BC4626]' : 
                        review.rating > 3 ? 'bg-[#347486]/10 text-[#347486]' :
                        'bg-[#DFA55D]/10 text-[#DFA55D]'
                      }`}>
                        <span className="text-lg font-bold">
                          {review.user?.full_name?.[0] || "A"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {review.user?.full_name || "Anonymous User"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      review.rating < 2 ? 'bg-[#BC4626] text-white' :
                      review.rating > 3 ? 'bg-[#347486] text-white' :
                      'bg-[#DFA55D] text-white'
                    }`}>
                      {review.rating}/5
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[#DFA55D] mb-3">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-600 line-clamp-3">{review.review}</p>
                  
                  <div className="mt-4 text-[#BC4626] text-sm font-medium hover:underline">
                    Read full review
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination or Load More - Simple Version */}
        {filteredReviews.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="bg-white shadow-md hover:shadow-lg border border-gray-200 px-6 py-3 rounded-lg text-[#BC4626] font-medium transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Load More Reviews
            </button>
          </div>
        )}
      </div>
      
      {/* Review Detail Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
          >
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#BC4626]">Review Details</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                  selectedReview.rating < 2 ? 'bg-[#BC4626]/10 text-[#BC4626]' : 
                  selectedReview.rating > 3 ? 'bg-[#347486]/10 text-[#347486]' :
                  'bg-[#DFA55D]/10 text-[#DFA55D]'
                }`}>
                  <span className="text-xl font-bold">
                    {selectedReview.user?.full_name?.[0] || "A"}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-800">
                    {selectedReview.user?.full_name || "Anonymous User"}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(selectedReview.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-[#DFA55D]">
                    {renderStars(selectedReview.rating)}
                  </div>
                  <span className="text-gray-600 font-medium ml-2">
                    {["Terrible", "Poor", "Average", "Good", "Excellent"][selectedReview.rating - 1]}
                  </span>
                </div>
                
                <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                  selectedReview.rating < 2 ? 'bg-[#BC4626] text-white' :
                  selectedReview.rating > 3 ? 'bg-[#347486] text-white' :
                  'bg-[#DFA55D] text-white'
                }`}>
                  {selectedReview.rating}/5
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.review}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <h5 className="font-semibold text-gray-700 mb-3">Review ID</h5>
                <div className="bg-gray-50 rounded p-3 flex items-center">
                <span className="font-mono text-sm text-gray-500 break-all">{selectedReview._id}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedReview._id);
                    // Could add a toast notification here
                  }}
                  className="ml-2 text-gray-400 hover:text-[#BC4626] p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-[#BC4626] text-white font-medium hover:bg-[#a43d22] rounded-lg transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>)}
    </div>
  )
};

export default ServiceReviews;