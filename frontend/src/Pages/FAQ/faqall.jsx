import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [formData, setFormData] = useState({ question: "" });
  const [answerInputs, setAnswerInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("You're not logged in.");
      window.location.href = "/login";
      return;
    }
    fetchFaqs();
  }, [token]);

  const fetchFaqs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/faqAll/all`);
      setFaqs(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching FAQs:", err.response?.data || err.message);
      toast.error("Failed to fetch FAQs");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (e, faqId) => {
    setAnswerInputs({ ...answerInputs, [faqId]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await axios.post(`${backendUrl}/api/faqAll/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("FAQ added successfully!");
      setFormData({ question: "" });
      await fetchFaqs();
    } catch (err) {
      console.error("FAQ create error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create FAQ");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddAnswer = async (faqId) => {
    const answer = answerInputs[faqId];
    if (!answer) return toast.warning("Please type an answer.");

    try {
      await axios.put(
        `${backendUrl}/api/faqAll/answer/${faqId}`,
        { answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Answer added successfully!");
      setAnswerInputs((prev) => ({ ...prev, [faqId]: "" }));

      // Inject answer into local state
      setFaqs((prevFaqs) =>
        prevFaqs.map((faq) =>
          faq._id === faqId
            ? { ...faq, answers: [...(faq.answers || []), answer] }
            : faq
        )
      );
    } catch (err) {
      console.error("Error adding answer:", err.response?.data || err.message);
      toast.error("Failed to add answer");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await axios.delete(`${backendUrl}/api/faqAll/delete/${faqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("FAQ deleted successfully!");
      await fetchFaqs();
    } catch (err) {
      console.error("Error deleting FAQ:", err.response?.data || err.message);
      toast.error("Failed to delete FAQ");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Q & A</h2>

      <form onSubmit={handleSubmit} className="mb-10">
        <label className="block mb-2 font-semibold text-gray-700">Question</label>
        <input
          type="text"
          name="question"
          value={formData.question}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400"
          placeholder="Enter a question..."
          required
        />
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold ${
            submitLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={submitLoading}
        >
          {submitLoading ? "Submitting..." : "Ask Question"}
        </button>
      </form>

      <div className="space-y-6">
        {faqs.map((faq) => (
          <div key={faq._id} className="border p-5 rounded-md shadow-sm">
            <h3 className="font-bold text-lg text-gray-800">{faq.question}</h3>

            <div className="mt-3">
              {faq.answers && faq.answers.length > 0 ? (
                faq.answers.map((answer, index) => (
                  <p key={index} className="text-green-700 mt-1">
                    Answer {index + 1}: {answer}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 mt-1">No answers yet.</p>
              )}

              <input
                type="text"
                placeholder="Type your answer..."
                className="border px-3 py-2 rounded w-full mb-2 focus:ring-2 focus:ring-green-400"
                value={answerInputs[faq._id] || ""}
                onChange={(e) => handleAnswerChange(e, faq._id)}
              />
              <button
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                onClick={() => handleAddAnswer(faq._id)}
              >
                Add Answer
              </button>
            </div>

            <button
              className="bg-red-500 text-white px-4 py-1 mt-4 rounded hover:bg-red-600"
              onClick={() => handleDeleteFaq(faq._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqManager;
