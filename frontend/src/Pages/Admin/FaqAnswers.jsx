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
  const [userRole, setUserRole] = useState();

  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, [token]);

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
    } catch (err) {
      console.error("Error deleting FAQ:", err.response?.data || err.message);
      toast.error("Failed to delete FAQ");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading FAQs...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white max-w-5xl w-full rounded-3xl shadow-xl p-10 flex flex-col gap-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Manage FAQs</h1>
        
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search question here"
          className="w-full border rounded-full px-4 py-2 shadow-sm focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FAQ List */}
        {faqs
          .filter((faq) => faq.question.toLowerCase().includes(search.toLowerCase()))
          .map((faq) => (
            <details key={faq._id} className="mb-3 border-b pb-2 cursor-pointer">
              <summary className="font-medium text-gray-800 flex justify-between">
                {faq.question}
                {(userRole === "admin" || userRole === "pet_owner") && (
                  <button className="text-blue-500 text-sm hover:underline" onClick={() => handleEditClick(faq)}>
                    Answer
                  </button>
                )}
              </summary>
              <p className="text-gray-600 mt-2">{faq.answer || "No answer provided."}</p>
              {userRole === "admin" && faq.answer && (
                <>
                  {!faq.approved ? (
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-2"
                      onClick={() => handleConfirmAnswer(faq._id)}
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 mt-2"
                      onClick={() => handleDeleteFaq(faq._id)}
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </details>
          ))}
      </div>

      {/* Answer Editor */}
      {editingFaq && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-lg w-1/3 ml-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Answer the Question</h2>
          <p className="text-sm text-gray-600 mb-2">{editingFaq.question}</p>
          <textarea
            className="w-full border p-2 rounded-md focus:outline-none"
            rows="4"
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="mt-4 flex justify-between">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={handleSaveAnswer}>
              Save
            </button>
            <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400" onClick={() => setEditingFaq(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqAdmin;
