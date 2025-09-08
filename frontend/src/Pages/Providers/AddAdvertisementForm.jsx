import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Sample pet images for the slideshow
const petImages = [
  'https://i.postimg.cc/kGZ67q21/Vanchuyen-Thucung.webp',
  'https://i.postimg.cc/tCx7h0Zb/Imagevr2q-1586410227900.jpg',
  'https://i.postimg.cc/s26ZTYVC/calming-hub-hero-dog-cat-resized-1024x615.avif',
  'https://i.postimg.cc/kMF79nbB/Tg-Qddsfvx-BNBpk-Riq87-Qeb.jpg',
];

const AddAdvertisementForm = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Service');
  const [image_url, setImageUrl] = useState('');
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % petImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      navigate('/provider-profile');
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Photo Section - Now separate from form with paragraph below */}
        <div className="w-full mb-8">
          <div className="h-64 md:h-96 relative overflow-hidden rounded-xl shadow-lg">
            {petImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <img
                  src={img}
                  alt={`Pet ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Slide indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {petImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-[#BC4626]' : 'bg-white bg-opacity-50'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600 text-lg">
            Showcase your pet services or products with our platform. Reach thousands of pet lovers in your area!
          </p>
        </div>

        {/* Form Section - Now standalone */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 md:p-8">
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
    </div>
  );
};

export default AddAdvertisementForm;