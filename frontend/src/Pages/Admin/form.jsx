import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddAdvertisementForm = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Service');
  const [image_url, setImageUrl] = useState('');
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add an advertisement');
        setLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.post(
        `${backendUrl}/api/advertisement/create`,
        { title, description, category, image_url, start_date, end_date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Advertisement added successfully!');
      navigate('/admin/AdvertisingManagement'); // Redirect to the ads page after successful addition
      setTitle('');
      setDescription('');
      setCategory('Service');
      setImageUrl('');
      setStartDate('');
      setEndDate('');
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add advertisement.');
      toast.error(err.response?.data?.message || 'Failed to add advertisement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-[#BC4626] mb-6">
          Add New Advertisement
        </h2>

        {error && (
          <div className="text-[#BC4626] text-center mb-6 p-4 bg-red-50 rounded-lg border border-[#BC4626] border-opacity-30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Title <span className="text-[#BC4626]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter advertisement title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D]"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Description <span className="text-[#BC4626]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe your advertisement"
              className="w-full p-3 h-32 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D]"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Category <span className="text-[#BC4626]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D] bg-white"
            >
              <option value="Service">Pet Service</option>
              <option value="Product">Pet Products</option>
              <option value="Rescue Pet">Rescue Pet</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-lg font-medium mb-2">
              Image URL <span className="text-[#BC4626]">*</span>
            </label>
            <input
              type="url"
              value={image_url}
              onChange={(e) => setImageUrl(e.target.value)}
              required
              placeholder="Enter image URL"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-lg font-medium mb-2">
                Start Date <span className="text-[#BC4626]">*</span>
              </label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D]"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-lg font-medium mb-2">
                End Date <span className="text-[#BC4626]">*</span>
              </label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D]"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/provider-profile')}
              className="w-1/3 py-3 bg-gray-300 text-gray-700 text-lg font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-2/3 py-3 bg-[#BC4626] text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#a33d21] transition duration-300 ease-in-out ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Adding...' : 'Add Advertisement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdvertisementForm;