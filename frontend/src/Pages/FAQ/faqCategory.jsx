import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const FaqList = () => {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/faqs/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaqs(response.data);
      } catch (err) {
        console.error("Error fetching FAQs:", err.response?.data || err.message);
        toast.error("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFaqs();
    } else {
      toast.error("You're not logged in.");
      window.location.href = "/login";
    }
  }, [token]);

  // Group FAQs by category with handling for empty or undefined categories
  const groupFaqsByCategory = (faqs) => {
    return faqs.reduce((acc, faq) => {
      const category = faq.category ? faq.category.trim() : "General";

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(faq);
      return acc;
    }, {});
  };

  // Filter FAQs based on the search query
  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  // Group filtered FAQs by category
  const faqCategories = groupFaqsByCategory(filteredFaqs);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 p-6 flex items-center justify-center relative">
      <ToastContainer />
      
      {/* Navigate to Create FAQ Form */}
      <button
        className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
        onClick={() => navigate("/Faq")}
      >
        + Add FAQ
      </button>

      <div className="bg-white max-w-5xl w-full rounded-3xl shadow-xl p-10 flex flex-col md:flex-row gap-10">
        {/* Left Side: FAQ Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Frequently Asked Questions</h1>

          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search question here"
              className="w-full border rounded-full px-4 py-2 pl-10 shadow-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* FAQ List Grouped by Category */}
          {Object.keys(faqCategories).length > 0 ? (
            Object.entries(faqCategories).map(([category, faqs]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">{category}</h3>
                <div>
                  {faqs.map((faq) => (
                    <details key={faq._id} className="mb-3 border-b pb-2 cursor-pointer">
                      <summary className="font-medium text-gray-800">{faq.question}</summary>
                      <p className="text-gray-600 mt-2">{faq.answer || "No answer provided."}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No matching FAQs found.</p>
          )}
        </div>

        {/* Right Side: Illustration (Optional) */}
        <div className="hidden md:block flex-1">
          <img
            src="https://img.freepik.com/premium-photo/happy-pets-portrait-french-bulldog-cute-little-kitten-pale-light-blue-background_495423-52128.jpg"
            alt="FAQ Illustration"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FaqList;
