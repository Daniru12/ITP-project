import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  // Color theme variables
  const colors = {
    primary: "#BC4626", // Terracotta Red
    secondary: "#DFA55D", // Sandy Gold
    accent: "#347486", // Teal Blue
    white: "#FFFFFF", // White
    lightGray: "#f8f9fa", // Light Gray for backgrounds
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("You're not logged in.");
      window.location.href = "/login";
      return;
    }
    
    // Check if user is admin
    checkAdminStatus();
    fetchFaqs();
  }, [token]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to verify admin status");
      
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (err) {
      console.error("Error checking admin status:", err);
      setIsAdmin(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/faqAll/all`);
      
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      
      const data = await response.json();
      setFaqs(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      toast.error("Failed to fetch FAQs");
      setLoading(false);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleAnswerChange = (e) => {
    setAnswerInput(e.target.value);
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      toast.warning("Please enter a question");
      return;
    }
    
    setSubmitLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/faqAll/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });
      
      if (!response.ok) throw new Error("Failed to create FAQ");
      
      toast.success("Question submitted successfully!");
      setQuestion("");
      await fetchFaqs();
    } catch (err) {
      console.error("FAQ create error:", err);
      toast.error("Failed to create FAQ");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddAnswer = async (faqId) => {
    if (!answerInput.trim()) {
      toast.warning("Please type an answer.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/faqAll/answer/${faqId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: answerInput }),
      });
      
      if (!response.ok) throw new Error("Failed to add answer");
      
      toast.success("Answer added successfully!");
      setAnswerInput("");
      setReplyingTo(null);

      // Update local state
      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) =>
          faq._id === faqId
            ? { ...faq, answers: [...(faq.answers || []), answerInput] }
            : faq
        )
      );
    } catch (err) {
      console.error("Error adding answer:", err);
      toast.error("Failed to add answer");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const response = await fetch(`${backendUrl}/api/faqAll/delete/${faqId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("Failed to delete FAQ");
      
      toast.success("FAQ deleted successfully!");
      await fetchFaqs();
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      toast.error("Failed to delete FAQ");
    }
  };

  const toggleExpand = (faqId) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: !prev[faqId]
    }));
  };

  const toggleReply = (faqId) => {
    setReplyingTo(replyingTo === faqId ? null : faqId);
    setAnswerInput(""); // Clear input when toggling
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-xl mt-10" style={{ backgroundColor: colors.white, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.primary }}>
        Community Questions & Answers
      </h2>

      <div className="mb-10">
        <div className="flex">
          <input
            type="text"
            value={question}
            onChange={handleQuestionChange}
            className="w-full border rounded-l px-4 py-3 focus:outline-none focus:ring-2"
            style={{ borderColor: colors.secondary, focusRing: colors.secondary }}
            placeholder="Ask a question..."
          />
          <button
            onClick={handleSubmitQuestion}
            className="px-6 py-3 font-semibold rounded-r text-white transition-colors duration-200 hover:opacity-90"
            style={{ 
              backgroundColor: submitLoading ? `${colors.secondary}80` : colors.secondary,
              cursor: submitLoading ? "not-allowed" : "pointer" 
            }}
            disabled={submitLoading}
          >
            {submitLoading ? "Sending..." : "Ask"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {faqs.length === 0 ? (
          <div className="text-center py-8 rounded-lg" style={{ backgroundColor: colors.lightGray }}>
            <p className="text-gray-500">No questions have been asked yet. Be the first!</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq._id} className="rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
              {/* Question */}
              <div className="p-4 flex items-start justify-between" style={{ backgroundColor: `${colors.secondary}15` }}>
                <div>
                  <p className="font-bold" style={{ color: colors.primary }}>{faq.question}</p>
                  <div className="text-xs mt-1 text-gray-500 flex items-center">
                    <span>{faq.answers && faq.answers.length > 0 ? 
                      `${faq.answers.length} ${faq.answers.length === 1 ? 'answer' : 'answers'}` : 
                      'No answers yet'}</span>
                    
                    {faq.answers && faq.answers.length > 1 && (
                      <button 
                        onClick={() => toggleExpand(faq._id)}
                        className="ml-2 text-xs underline"
                        style={{ color: colors.accent }}
                      >
                        {expandedFaqs[faq._id] ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    className="text-white text-sm px-3 py-1 rounded-full transition-colors"
                    style={{ backgroundColor: colors.accent }}
                    onClick={() => toggleReply(faq._id)}
                  >
                    {replyingTo === faq._id ? 'Cancel' : 'Reply'}
                  </button>
                  
                  {isAdmin && (
                    <button
                      className="text-white text-sm px-3 py-1 rounded-full transition-colors"
                      style={{ backgroundColor: colors.primary }}
                      onClick={() => handleDeleteFaq(faq._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Answers */}
              {faq.answers && faq.answers.length > 0 && (
  <div className="px-4 py-2" style={{ backgroundColor: colors.white }}>
    {!expandedFaqs[faq._id] ? (
      <div className="py-2 border-b border-gray-100">
        <p style={{ color: colors.accent }}>{faq.answers[faq.answers.length - 1]}</p>
      </div>
    ) : (
      faq.answers.map((answer, index) => (
        <div key={index} className="py-2 border-b border-gray-100 last:border-0">
          <p style={{ color: colors.accent }}>{answer}</p>
        </div>
      ))
    )}
  </div>
)}

              {/* Answer Input - Only show when replying to this FAQ */}
              {replyingTo === faq._id && (
                <div className="flex px-4 py-3 bg-gray-50">
                  <input
                    type="text"
                    placeholder="Add your answer..."
                    className="flex-grow border rounded-l px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.accent, focusRing: colors.accent }}
                    value={answerInput}
                    onChange={handleAnswerChange}
                  />
                  <button
                    className="px-4 py-2 text-white font-medium rounded-r transition-colors hover:opacity-90"
                    style={{ backgroundColor: colors.accent }}
                    onClick={() => handleAddAnswer(faq._id)}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FaqManager;