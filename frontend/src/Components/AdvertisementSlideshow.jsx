import React, { useState, useEffect, useCallback } from 'react';
import { MdAddCircleOutline, MdDelete } from 'react-icons/md';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import axios from 'axios';
import AddAdvertisementForm from '../Pages/Advertisement/AddAdvertisementForm';
import toast from 'react-hot-toast';

export const AdvertisementSlideshow = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        const response = await axios.get(`${backendUrl}/api/advertisement`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdvertisements(response.data);
      } catch (err) {
        setError(err);
        toast.error('Failed to load advertisements');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [showAddForm]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
  }, [advertisements]);

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + advertisements.length) % advertisements.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleDelete = async (adId) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      await axios.delete(`${backendUrl}/api/advertisement/delete/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdvertisements(advertisements.filter((ad) => ad._id !== adId));
      toast.success('Advertisement deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete advertisement.');
      toast.error('Failed to delete advertisement');
    }
  };

  useEffect(() => {
    let interval;
    if (isPlaying && !isHovering && !loading && advertisements.length > 0) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isHovering, nextSlide, loading, advertisements]);

  if (loading) {
    return <div>Loading advertisements...</div>;
  }

  if (error) {
    return <div>Error loading advertisements: {error.message}</div>;
  }

  return (
    <div>
      {showAddForm && <AddAdvertisementForm onClose={() => setShowAddForm(false)} />}
      <div
        className="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg bg-white"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative h-[2000px] sm:h-[700px]">
          {advertisements.map((ad, index) => (
            <div
              key={ad._id}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="absolute w-full h-full object-cover my-1 rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white z-20">
                  <h2 className="text-3xl font-bold mb-2">{ad.title}</h2>
                  <p className="text-lg mb-4 max-w-lg">{ad.description}</p>
                  {ad.ctaUrl && (
                    <a
                      href={ad.ctaUrl}
                      className="inline-block px-6 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {ad.ctaText || 'Learn More'}
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(ad._id)}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full text-red-500 bg-red-300/50 hover:bg-white/45 text-2xl backdrop-blur-sm transition-colors"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 text-white backdrop-blur-sm transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 text-white backdrop-blur-sm transition-colors"
          aria-label="Next slide"
        >
          <ChevronRightIcon size={24} />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="absolute top-4 right-4 z-20 p-4 rounded-full text-blue-500 bg-blue-300/50 hover:bg-white/45 text-4xl backdrop-blur-sm transition-colors"
        >
          <MdAddCircleOutline />
        </button>
      </div>
    </div>
  );
};