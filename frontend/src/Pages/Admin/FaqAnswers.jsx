import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

const FaqAdmin = () => {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const [answer, setAnswer] = useState("");
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, approved, pending
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const faqResponse = await axios.get(`${backendUrl}/api/faqs/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaqs(faqResponse.data);

        if (token) {
          const decoded = jwtDecode(token);
          setUserRole(decoded.user_type);
        }
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      toast.error("You're not logged in.");
      window.location.href = "/login";
    }
  }, [token, backendUrl]);

  const handleEditClick = (faq) => {
    if (userRole === "admin" || userRole === "pet_owner") {
      setEditingFaq(faq);
      setAnswer(faq.answer || "");
    } else {
      toast.error("You do not have permission to edit answers.");
    }
  };

  const handleSaveAnswer = async () => {
    if (!editingFaq) return;

    try {
      await axios.put(
        `${backendUrl}/api/faqs/updateAns/${editingFaq._id}`,
        { answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) =>
          faq._id === editingFaq._id ? { ...faq, answer } : faq
        )
      );

      toast.success("Answer updated successfully");
      setEditingFaq(null);
      setAnswer("");
    } catch (err) {
      console.error("Error updating answer:", err.response?.data || err.message);
      toast.error("Failed to update answer");
    }
  };

  const handleConfirmAnswer = async (faqId) => {
    try {
      await axios.put(
        `${backendUrl}/api/faqs/confirmAns/${faqId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) =>
          faq._id === faqId ? { ...faq, approved: true } : faq
        )
      );

      toast.success("FAQ answer approved successfully");
    } catch (err) {
      console.error("Error confirming answer:", err.response?.data || err.message);
      toast.error("Failed to confirm answer");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    try {
      await axios.delete(`${backendUrl}/api/faqs/delete/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFaqs((prevFaqs) => prevFaqs.filter((faq) => faq._id !== faqId));
      toast.success("FAQ deleted successfully");
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting FAQ:", err.response?.data || err.message);
      toast.error("Failed to delete FAQ");
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    // Filter by search term
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "approved") return matchesSearch && faq.approved;
    if (activeTab === "pending") return matchesSearch && !faq.approved;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
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
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h1 className="text-3xl font-bold text-white">Manage FAQs</h1>
            <p className="text-blue-100 mt-2">Review, answer, and manage frequently asked questions</p>
          </div>
          
          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full border rounded-full px-4 py-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex bg-gray-100 rounded-full p-1">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('all')}
                >
                  All FAQs
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'approved' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('approved')}
                >
                  Approved
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending
                </button>
              </div>
            </div>
            
            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2">No FAQs found matching your criteria</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq._id} className={`border rounded-lg overflow-hidden transition-all ${faq.approved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                    <details className="group">
                      <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${faq.approved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <h3 className="font-medium text-gray-800">{faq.question}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {(userRole === "admin" || userRole === "pet_owner") && (
                            <button 
                              className="text-blue-500 hover:text-blue-700 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditClick(faq);
                              }}
                            >
                              Answer
                            </button>
                          )}
                          {userRole === "admin" && (
                            <button 
                              className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                              onClick={(e) => {
                                e.preventDefault();
                                setConfirmDelete(faq._id);
                              }}
                            >
                              Delete
                            </button>
                          )}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </summary>
                      
                      <div className="p-4 pt-0 border-t">
                        <div className="prose max-w-none">
                          {faq.answer ? (
                            <p className="text-gray-700">{faq.answer}</p>
                          ) : (
                            <p className="italic text-gray-500">No answer provided yet.</p>
                          )}
                        </div>
                        
                        {userRole === "admin" && faq.answer && !faq.approved && (
                          <button
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                            onClick={() => handleConfirmAnswer(faq._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve Answer
                          </button>
                        )}
                      </div>
                    </details>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Editor - Side Panel */}
      {editingFaq && (
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Answer the Question</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setEditingFaq(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-medium text-blue-800">{editingFaq.question}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
              <textarea
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setEditingFaq(null)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleSaveAnswer}
                disabled={!answer.trim()}
              >
                Save Answer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 m-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete FAQ</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this FAQ? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => handleDeleteFaq(confirmDelete)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqAdmin;