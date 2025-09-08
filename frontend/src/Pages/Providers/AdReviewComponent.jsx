import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  FaTrash,
  FaSearch,
  FaChevronDown,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdReviewComponent = () => {
  const [adDetails, setAdDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      setError('Invalid token. Please log in again.');
      return;
    }

    const fetchAdDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${apiUrl}/api/advertisement`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdDetails(response.data);
      } catch (err) {
        setError('Failed to fetch advertisement details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdDetails();
  }, []);

  const handleDelete = async (adId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this advertisement?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    try {
      const response = await axios.delete(`${apiUrl}/api/advertisement/delete/${adId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 204) {
        setAdDetails((prevAds) => prevAds.filter((ad) => ad._id !== adId));
        setStatusMessage('Advertisement deleted successfully.');
      } else {
        setError(`Failed to delete the advertisement. Server responded with status: ${response.status}`);
      }
    } catch (err) {
      if (err.response) {
        setError(`Failed to delete the advertisement. Error: ${err.response.data.message || err.message}`);
      } else {
        setError('Failed to delete the advertisement. An unknown error occurred.');
      }
    }
  };

  const filteredAds = adDetails.filter((ad) => {
    const titleMatches = ad.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatches =
      selectedCategory === 'All' || ad.category?.toLowerCase() === selectedCategory.toLowerCase();
    return titleMatches && categoryMatches;
  });

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  if (loading) return <div className="text-center py-4 text-lg text-blue-600">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4 text-lg">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate('/provider-profile')}
        className="mb-4 px-6 py-2 bg-[#347486] text-white rounded-full hover:bg-[#285e6d] transition-colors"
      >
        &larr; Back to Dashboard
      </button>

      <h2 className="text-4xl font-bold mb-8 text-center text-[#347486]">All Advertisements</h2>

      {statusMessage && (
        <div className="text-green-600 text-center mb-4">{statusMessage}</div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:justify-center md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search Advertisements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="relative w-full max-w-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-green-500"
          >
            <option value="All">All</option>
            <option value="Grooming">Rescue Pet</option>
            <option value="Vet">Pet Products</option>
            <option value="Training">Pet Service</option>
          </select>
          <FaChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Ad Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredAds.length === 0 ? (
          <div className="col-span-full text-center text-gray-600 text-lg">
            No advertisement details available.
          </div>
        ) : (
          filteredAds.map((ad) => (
            <div
              key={ad._id}
              className="border rounded-md p-6 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 bg-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">{ad.title}</h3>
                <button
                  onClick={() => handleDelete(ad._id)}
                  className="text-red-700 hover:text-red-900 text-2xl"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                {ad.status === 'approved' ? (
                  <span className="px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold">Approved</span>
                ) : ad.status === 'rejected' ? (
                  <span className="px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-semibold">Rejected</span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">Pending</span>
                )}
              </div>

              <p className="mb-3 text-lg text-gray-600">{ad.description}</p>
              <div className="mb-2 text-lg text-gray-700">
                <strong>Category:</strong> {ad.category}
              </div>
              <div className="mb-4">
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="mt-3 w-full h-48 object-cover rounded-md"
                />
              </div>
              <div className="mb-2 text-lg text-gray-700">
                <strong>Start Date:</strong> {formatDate(ad.start_date)}
              </div>
              <div className="mb-2 text-lg text-gray-700">
                <strong>End Date:</strong> {formatDate(ad.end_date)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdReviewComponent;
