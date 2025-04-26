import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const CreateFaq = () => {
  const [formData, setFormData] = useState({
    question: "",
    category: "", // Ensure this starts empty
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Validate token on initial load
  useEffect(() => {
    if (!token) {
      toast.error("You're not logged in.");
      window.location.href = "/login";
      return;
    }
    setLoading(false);
  }, [token]);

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

      toast.success("FAQ created successfully!");
      setFormData({ question: "", category: "" });
      navigate("/faqList");
    } catch (err) {
      console.error("FAQ create error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create FAQ");
    } finally {
      setSubmitLoading(false);
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
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 text-center">Create FAQ</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Question</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select a category</option>
            <option value="General">General</option>
            <option value="Financial">Financial</option>
            <option value="Technical">Technical</option>
            <option value="Related to Services">Related to Services</option>
          </select>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${submitLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={submitLoading}
        >
          {submitLoading ? "Submitting..." : "Create FAQ"}
        </button>
      </form>
    </div>
  );
};

export default CreateFaq;
