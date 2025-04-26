import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const UpdateAdvertisementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Service");
  const [image_url, setImageUrl] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");  // 'en-CA' for ISO format YYYY-MM-DD
  };

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please log in to update an advertisement.");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${backendUrl}/api/advertisement/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ad = response.data;
        setTitle(ad.title);
        setDescription(ad.description);
        setCategory(ad.category);
        setImageUrl(ad.image_url);
        setStartDate(formatDate(ad.start_date));
        setEndDate(formatDate(ad.end_date));
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching advertisement details.");
        navigate("/ads");
      }
    };

    fetchAdDetails();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to update an advertisement.");
        navigate("/login");
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.put(
        `${backendUrl}/api/advertisement/update/${id}`,
        { title, description, category, image_url, start_date, end_date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Advertisement updated successfully!");
      navigate("/AdReviewComponent"); // Redirect after update
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Unauthorized: Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.status === 403) {
        toast.error("You do not have permission to update this advertisement.");
      } else {
        toast.error(err.response?.data?.message || "Failed to update advertisement.");
      }
      setError(err.response?.data?.message || "Failed to update advertisement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Update Advertisement
        </h2>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-lg mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-lg mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3 h-28 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-700 text-lg mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Service">Service</option>
              <option value="Product">Product</option>
              <option value="Rescue Pet">Rescue Pet</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-lg mb-1">Image URL</label>
            <input
              type="url"
              value={image_url}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-lg mb-1">Start Date</label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg mb-1">End Date</label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update Advertisement"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdvertisementForm;
