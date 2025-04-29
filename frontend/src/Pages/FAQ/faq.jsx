import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const CreateFaq = () => {
  const [formData, setFormData] = useState({
    question: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  // Theming colors based on requirements
  const theme = {
    primary: "#BC4626",    // Terracotta Red
    secondary: "#DFA55D",  // Sandy Gold
    accent: "#347486",     // Teal Blue
    white: "#FFFFFF",      // White
  };

  // Validate token on initial load
  useEffect(() => {
    // Simulate authentication check
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const showToast = (message, isError = false) => {
    setToastMessage({
      text: message,
      isError,
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Debugging: Log form data before submitting
    console.log("Form Data Before Submit:", formData);

    try {
      const response = await axios.post(
        `${backendUrl}/api/faqs/create`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Response from API:", response);
      toast.success("FAQ created successfully!");
    // Simulate API call
    setTimeout(() => {
      showToast("FAQ created successfully!");
      setFormData({ question: "", category: "" });
      setSubmitLoading(false);

      // Navigate to the desired page after successful submission
      navigate("/faqList");  // Replace with your target route
    }, 1500);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: theme.white }}>
        <div className="p-6 rounded-lg shadow-lg bg-white">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: theme.primary, borderTopColor: 'transparent' }}></div>
            <p className="mt-4 text-xl font-medium" style={{ color: theme.accent }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: `linear-gradient(135deg, ${theme.white} 0%, ${theme.secondary}33 100%)`,
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center z-50 max-w-md"
          style={{ 
            backgroundColor: toastMessage.isError ? '#f44336' : '#4CAF50',
            color: theme.white
          }}
        >
          <div className="mr-3">
            {toastMessage.isError ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto flex flex-row shadow-2xl rounded-xl overflow-hidden">
        {/* Left Side - Decorative */}
        <div className="hidden md:block w-1/2 relative" style={{ backgroundColor: theme.accent }}>
          <div className="absolute inset-0 flex flex-col justify-center items-center p-12">
            <div className="mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke={theme.white}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6">FAQ Management</h1>
            <p className="text-lg text-white opacity-90 text-center">Create and manage frequently asked questions for your customers with our intuitive interface.</p>
            
            <div className="mt-16 flex flex-col w-full space-y-4">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                <div className="bg-white rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={theme.accent}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-black">Easy to use interface</span>
              </div>
              
              <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                <div className="bg-white rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={theme.accent}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-black">Categorize your questions</span>
              </div>
              
              <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                <div className="bg-white rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={theme.accent}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-black">Instant updates and notifications</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-white">
          <div 
            className="py-6 px-6"
            style={{ backgroundColor: theme.primary }}
          >
            <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New FAQ
            </h2>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Question</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ 
                      boxShadow: formData.question ? `0 0 0 2px ${theme.accent}` : 'none',
                    }}
                    placeholder="Enter your question here"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none"
                    style={{ 
                      boxShadow: formData.category ? `0 0 0 2px ${theme.accent}` : 'none',
                    }}
                  >
                    <option value="">Select a category</option>
                    <option value="General">General</option>
                    <option value="Financial">Financial</option>
                    <option value="Technical">Technical</option>
                    <option value="Related to Services">Related to Services</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center space-x-4">
                <button
  onClick={() => {}}
  className="w-1/2 flex justify-center items-center py-4 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 transition-all duration-200"
  style={{ boxShadow: `0 0 0 2px ${theme.secondary}` }}
>
  <a href="/faqList" className="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Cancel
  </a>
</button>

                
                  <button
                    onClick={handleSubmit}
                    className="w-1/2 flex justify-center items-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ 
                      backgroundColor: submitLoading ? `${theme.primary}88` : theme.primary,
                      cursor: submitLoading ? "not-allowed" : "pointer",
                    }}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create FAQ
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center" style={{ color: theme.accent }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Need help? Check out our <span className="font-medium underline cursor-pointer">FAQ documentation</span></span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: theme.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm text-gray-600">View all FAQs</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: theme.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFaq;