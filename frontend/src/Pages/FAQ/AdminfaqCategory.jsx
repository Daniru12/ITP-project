import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const FaqAdminTable = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
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
          setUserRole(decoded.user_type); // Set user role from token
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

  // Handle delete FAQ
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

        {/* Table to display FAQs */}
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Question</th>
              <th className="py-2 px-4 border-b text-left">Answer</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq._id}>
                <td className="py-2 px-4 border-b">{faq.question}</td>
                <td className="py-2 px-4 border-b">{faq.answer || "No answer provided"}</td>
                <td className="py-2 px-4 border-b">
                  {/* Use Link for navigating to the FaqAdmin page */}
                  <Link
                    to={`/faqAdmin/${faq._id}`} // Dynamically navigate to the FaqAdmin page using FAQ ID
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)} // Delete action
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FaqAdminTable;
