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
  
  // Count FAQs in each category
  const countFaqsInCategory = (category) => {
    return faqCategories[category]?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f8f9fa]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-[#BC4626] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[#347486]">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white border-b py-6 px-4 mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-medium text-center text-[#333333]">How can we help?</h1>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-2xl mx-auto flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l bg-[#f8f9fa] focus:outline-none focus:ring-1 focus:ring-[#BC4626] focus:border-[#BC4626]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-[#BC4626] text-white px-4 py-2 rounded-r hover:bg-opacity-90">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 mb-4">
        <div className="flex items-center text-sm text-gray-500 bg-[#f0f2f5] py-2 px-4 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Help Center</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Categories */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-medium text-[#347486]">Help Center</h2>
                <div className="text-sm text-gray-500">({faqs.length})</div>
              </div>
              <div className="p-4">
                {Object.keys(faqCategories).map((category) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <a 
                      href={`#${category}`} 
                      className="flex items-center text-gray-700 hover:text-[#BC4626] py-2 px-2 rounded hover:bg-gray-50"
                    >
                      <span className="flex-grow">{category}</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {countFaqsInCategory(category)}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Add FAQ Button */}
            <div className="bg-white rounded shadow p-4 text-center">
              <button
                className="w-full bg-[#DFA55D] text-white py-2 px-4 rounded hover:bg-opacity-90 transition-all duration-200"
                onClick={() => navigate("/Faq")}
              >
                + Add FAQ
              </button>
            </div>
          </div>

          {/* Right Column: FAQ Content */}
          <div className="w-full md:w-2/3">
            {Object.keys(faqCategories).length > 0 ? (
              Object.entries(faqCategories).map(([category, categoryFaqs]) => (
                <div key={category} id={category} className="bg-white rounded shadow mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-medium text-[#347486]">{category}</h2>
                    <div className="text-sm text-gray-500">
                      Learn all about {category.toLowerCase()} and find answers to common questions.
                    </div>
                  </div>
                  <div className="divide-y">
                    {categoryFaqs.map((faq) => (
                      <details key={faq._id} className="group">
                        <summary className="flex justify-between items-center px-6 py-3 cursor-pointer hover:bg-gray-50 list-none">
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#BC4626] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 font-medium group-hover:text-[#BC4626]">
                              {faq.question}
                            </span>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="px-6 py-4 bg-gray-50 border-t">
                          <div className="pl-7">
                            <p className="text-gray-600">{faq.answer || "No answer provided."}</p>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded shadow p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No matching FAQs found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any FAQs matching your search for "{search}"
                </p>
                <button 
                  className="text-[#BC4626] hover:underline"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © 2025 PetBacker
          </div>
          <button 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="flex items-center text-sm text-[#347486] hover:text-[#BC4626]"
          >
            <span>back to top</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqList;