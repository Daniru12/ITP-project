import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";

const CreateReview = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    rating: 1,
    review: "",
    service: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("You're not logged in.");
      navigate("/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      service: serviceId || "",
    }));
  }, [serviceId, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    console.log("Submitting review with data:", formData);

    try {
      const response = await axios.post(
        `${backendUrl}/api/reviews/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Review submitted successfully!");
      setFormData({ rating: 1, review: "", service: serviceId });

      setTimeout(() => {
        navigate(`/service-overview/${serviceId}`);

      }, 2000);
    } catch (err) {
      console.error("Review submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  // CSS styles for star rating display
  const starStyles = {
    container: {
      display: "flex",
      alignItems: "center",
      marginBottom: "1rem",
    },
    star: {
      color: "#DFA55D", // Sandy Gold color for stars
      fontSize: "2rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
  };

  // Function to render star rating UI
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => setFormData({ ...formData, rating: i })}
          style={{
            ...starStyles.star,
            opacity: i <= formData.rating ? 1 : 0.3,
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      style={{
        backgroundColor: "#F9F6F2", // Light cream background
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23BC4626\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      <div className="w-full max-w-xl">
        <div
          className="bg-white shadow-xl rounded-xl overflow-hidden"
          style={{
            boxShadow: "0 10px 25px rgba(188, 70, 38, 0.15), 0 5px 10px rgba(52, 116, 134, 0.1)",
          }}
        >
          <div
            className="py-6 px-6 text-center"
            style={{
              background: "linear-gradient(135deg, #BC4626 0%, #DFA55D 100%)",
              borderBottom: "4px solid #347486",
            }}
          >
            <h2
              className="text-2xl font-bold text-white flex items-center justify-center"
              style={{
                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              Write a Review
            </h2>
          </div>

          <div className="p-8">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Rate Your Experience
                </label>
                <div style={starStyles.container}>{renderStarRating()}</div>
                <input type="hidden" name="rating" value={formData.rating} />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Your Review
                </label>
                <div className="relative">
                  <textarea
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200"
                    placeholder="Describe your experience..."
                    rows="5"
                    style={{
                      borderColor: "#DFA55D",
                      boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "#347486")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "#DFA55D")
                    }
                    required
                  ></textarea>
                  <div
                    className="absolute bottom-3 right-3 opacity-50"
                    style={{ color: "#BC4626" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Tell us what you liked or what could be improved.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white transition-all duration-200 ${
                    submitLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "transform hover:-translate-y-1"
                  }`}
                  style={{
                    background: submitLoading
                      ? "#DFA55D"
                      : "linear-gradient(to right, #BC4626, #DFA55D)",
                    boxShadow: "0 4px 10px rgba(188, 70, 38, 0.25)",
                  }}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium inline-flex items-center transition-colors duration-200"
            style={{ color: "#347486" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReview;