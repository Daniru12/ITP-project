import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaSpinner, FaThumbsUp, FaCalendarAlt, FaFilter, FaSortAmountDown } from "react-icons/fa";

const ReviewsList = ({ serviceId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedReview, setExpandedReview] = useState(null);
  const [sortBy, setSortBy] = useState("recent"); // recent, rating
  const [filterRating, setFilterRating] = useState(0); // 0 = all, 1-5 = specific rating
  const [helpfulMarks, setHelpfulMarks] = useState({});

  // Custom color variables
  const colors = {
    primary: "#BC4626",    // Terracotta Red
    secondary: "#DFA55D",  // Sandy Gold
    accent: "#347486",     // Teal Blue
    white: "#FFFFFF",      // White
    lightBg: "#FDF8F3",    // Light sandy background
    terracottaLight: "#F2D2C9", // Light terracotta
    accentLight: "#E4F1F4", // Light teal
    secondaryLight: "#F7EBD7", // Light sandy
    textDark: "#2D2A26",   // Dark text
    textMuted: "#6B6561",  // Muted text
  };

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
      stars.push(<FaStar key={`full-${i}`} className={`${size}`} style={{ color: colors.secondary }} />);
    }

    // Add half star if needed
    if (decimalPart >= 0.5) {
      stars.push(<FaStarHalfAlt key="half" className={`${size}`} style={{ color: colors.secondary }} />);
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className={`${size} text-gray-300`} />);
    }

    return stars;
  };

  // Apply filtering and sorting
  const processedReviews = useMemo(() => {
    let result = [...reviews];
    
    // Apply rating filter
    if (filterRating > 0) {
      result = result.filter(review => {
        // For example, rating 4 would include 4.0-4.9
        const ratingFloor = Math.floor(review.rating);
        return ratingFloor === filterRating;
      });
    }
    
    // Apply sorting
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "helpful") {
      result.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
    }
    
    return result;
  }, [reviews, sortBy, filterRating]);

  // Calculate average rating and rating counts
  const ratingStats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, counts: [0, 0, 0, 0, 0], total: 0 };
    }
    
    let sum = 0;
    const counts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
    
    reviews.forEach(review => {
      sum += review.rating;
      const ratingIndex = Math.floor(review.rating) - 1;
      if (ratingIndex >= 0 && ratingIndex < 5) {
        counts[4 - ratingIndex]++; // Reverse index (5 stars at index 0)
      }
    });
    
    return {
      average: sum / reviews.length,
      counts,
      total: reviews.length
    };
  }, [reviews]);

  const toggleExpandReview = (reviewId) => {
    if (expandedReview === reviewId) {
      setExpandedReview(null);
    } else {
      setExpandedReview(reviewId);
    }
  };

  const markHelpful = (reviewId) => {
    if (helpfulMarks[reviewId]) return;
    
    // Update local state
    setHelpfulMarks(prev => ({ ...prev, [reviewId]: true }));
    
    // Update review helpful count (in a real app, this would call an API)
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review._id === reviewId 
          ? { ...review, helpful: (review.helpful || 0) + 1 } 
          : review
      )
    );
  };

  const getRatingPercentage = (count) => {
    return ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16" style={{ color: colors.primary }}>
        <FaSpinner className="animate-spin text-4xl" />
        <span className="ml-3 text-lg font-semibold" style={{ color: colors.textDark }}>Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg shadow" style={{ backgroundColor: "#FAEDEB", borderLeft: `4px solid ${colors.primary}` }}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5" style={{ color: colors.primary }} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="font-semibold" style={{ color: colors.primary }}>Error loading reviews</p>
            <p className="text-sm" style={{ color: "#964A40" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: colors.white, borderColor: colors.secondaryLight, borderWidth: "1px" }}>
        {/* Header with gradient background */}
        <div style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}DD 100%)`,
          color: colors.white,
          padding: "1.5rem"
        }}>
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex mr-3">
                {renderStars(ratingStats.average, "text-2xl")}
              </div>
              <span className="font-bold text-2xl">{ratingStats.average.toFixed(1)}</span>
              <span className="ml-2 opacity-90">({ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'})</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                  className="appearance-none rounded-full py-1 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm text-black"
                  style={{ borderColor: colors.white, borderWidth: "1px", minWidth: "110px" }}
                >
                  <option value={0} style={{ color: colors.textDark }}>All Ratings</option>
                  <option value={5} style={{ color: colors.textDark }}>5 Stars</option>
                  <option value={4} style={{ color: colors.textDark }}>4 Stars</option>
                  <option value={3} style={{ color: colors.textDark }}>3 Stars</option>
                  <option value={2} style={{ color: colors.textDark }}>2 Stars</option>
                  <option value={1} style={{ color: colors.textDark }}>1 Star</option>
                </select>
                <FaFilter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-opacity-80" size={14} />
              </div>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-full py-1 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm text-black"
                  style={{ borderColor: colors.black, borderWidth: "1px", minWidth: "120px" }}
                >
                  <option value="recent" style={{ color: colors.textDark }}>Most Recent</option>
                  <option value="rating" style={{ color: colors.textDark }}>Highest Rated</option>
                  <option value="helpful" style={{ color: colors.textDark }}>Most Helpful</option>
                </select>
                <FaSortAmountDown className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-opacity-80" size={14} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Rating distribution - new section */}
        <div className="px-6 py-4" style={{ backgroundColor: colors.lightBg }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-2" style={{ color: colors.textMuted }}>RATING DISTRIBUTION</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star, index) => (
                  <div key={star} className="flex items-center text-sm">
                    <span className="w-8" style={{ color: colors.textDark }}>{star} star</span>
                    <div className="mx-2 flex-1 h-2 rounded-full" style={{ backgroundColor: "#E6E6E6" }}>
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${getRatingPercentage(ratingStats.counts[index])}%`,
                          backgroundColor: star > 3 ? colors.secondary : star > 1 ? colors.accent : colors.primary
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-right" style={{ color: colors.textMuted }}>{ratingStats.counts[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews content */}
        <div className="p-6">
          {processedReviews.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: colors.accentLight }}>
                <svg className="h-12 w-12" style={{ color: colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-xl font-medium mb-1" style={{ color: colors.textDark }}>
                {filterRating > 0 ? 'No reviews match your filter' : 'No reviews yet'}
              </p>
              <p style={{ color: colors.textMuted }}>
                {filterRating > 0 
                  ? 'Try selecting a different rating filter' 
                  : 'Be the first to share your experience with this service!'}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: colors.secondaryLight }}>
              {processedReviews.map((review) => {
                const isExpanded = expandedReview === review._id;
                const reviewLength = review.review?.length || 0;
                const shouldTruncate = reviewLength > 180 && !isExpanded;
                
                return (
                  <div 
                    key={review._id} 
                    className="py-6 first:pt-0 last:pb-0 transition-all duration-200"
                    style={{ 
                      borderColor: colors.secondaryLight,
                    }}
                  >
                    <div className="flex items-start">
                      {/* User avatar/icon */}
                      <div className="hidden sm:block flex-shrink-0 mr-4">
                        {review.user?.avatar ? (
                          <img 
                            src={review.user.avatar} 
                            alt={review.user?.full_name || "User"} 
                            className="h-14 w-14 rounded-full object-cover border-2"
                            style={{ borderColor: colors.terracottaLight }}
                          />
                        ) : (
                          <div 
                            className="h-14 w-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.secondaryLight }}
                          >
                            <FaUser style={{ color: colors.secondary }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Review content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div>
                            <h4 
                              className="font-semibold text-lg"
                              style={{ color: colors.textDark }}
                            >
                              {review.user?.full_name || "Anonymous"}
                            </h4>
                            <div className="flex items-center text-sm" style={{ color: colors.textMuted }}>
                              <FaCalendarAlt className="mr-1" size={12} />
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex">
                              {renderStars(review.rating, "text-lg")}
                            </div>
                            <span 
                              className="text-sm ml-2 font-medium"
                              style={{ color: colors.textDark }}
                            >
                              ({review.rating}/5)
                            </span>
                          </div>
                        </div>
                        
                        <div 
                          className="p-4 my-3 rounded-lg"
                          style={{ backgroundColor: colors.lightBg }}
                        >
                          {shouldTruncate ? (
                            <>
                              <p style={{ color: colors.textDark }}>{`${review.review.substring(0, 180)}...`}</p>
                              <button 
                                className="font-medium text-sm mt-2 focus:outline-none"
                                style={{ color: colors.accent }}
                                onClick={() => toggleExpandReview(review._id)}
                              >
                                Read more
                              </button>
                            </>
                          ) : (
                            <>
                              <p style={{ color: colors.textDark }}>{review.review}</p>
                              {reviewLength > 180 && (
                                <button 
                                  className="font-medium text-sm mt-2 focus:outline-none"
                                  style={{ color: colors.accent }}
                                  onClick={() => toggleExpandReview(review._id)}
                                >
                                  Show less
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Helpful button */}
                        <div className="mt-2 flex items-center">
                          <button
                            className={`flex items-center text-sm px-3 py-1 rounded-full transition-colors`}
                            style={{
                              backgroundColor: helpfulMarks[review._id] ? colors.accentLight : "#F0F0F0",
                              color: helpfulMarks[review._id] ? colors.accent : colors.textMuted
                            }}
                            onClick={() => markHelpful(review._id)}
                            disabled={helpfulMarks[review._id]}
                          >
                            <FaThumbsUp size={12} className="mr-1" />
                            {helpfulMarks[review._id] ? 'Marked as helpful' : 'Mark as helpful'}
                          </button>
                          {(review.helpful > 0 || helpfulMarks[review._id]) && (
                            <span className="text-xs ml-2" style={{ color: colors.textMuted }}>
                              {review.helpful || 1} {(review.helpful || 1) === 1 ? 'person' : 'people'} found this helpful
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Show more button for pagination (simplified) */}
        {reviews.length > 5 && (
          <div className="px-6 py-4 text-center" style={{ borderTop: `1px solid ${colors.secondaryLight}` }}>
            <button 
              className="px-6 py-2 rounded-full font-medium transition-colors"
              style={{ 
                backgroundColor: colors.accent,
                color: colors.white,
              }}
            >
              Load more reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;