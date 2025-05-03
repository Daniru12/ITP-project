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
  
  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: "https://i.postimg.cc/wj6rJm0d/STAR-Group-photos-29.jpg",
      caption: "Rescue Pet Love you all"
    },
    {
      image: "https://i.postimg.cc/BQGSrmQc/puppy-and-kitten-posing-with-pet-care-products.jpg",
      caption: "Bye Original Products"
    },
    {
      image: "https://i.postimg.cc/7h9WQPZR/course-4335051.jpg",
      caption: "Make Happy Your Pet"
    }
  ];

  // Advance slideshow automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // 'en-CA' for ISO format YYYY-MM-DD
  };

  // Fetch ad details on page load
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

      // Sending PUT request to update the advertisement
      await axios.put(
        `${backendUrl}/api/advertisement/update/${id}`,
        { title, description, category, image_url, start_date, end_date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Advertisement updated successfully!");
      navigate("/admin/AdvertisingManagement"); // Redirect after update
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

  // Go to next slide manually
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Go to previous slide manually
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center py-16 px-6" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1565318253221-15382ec7754f?q=80&w=2070')" }}>
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center">
        {/* Image Slideshow and Description Section */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            {/* Slideshow container */}
            <div className="relative">
              {/* Images */}
              <div className="w-full h-80 relative overflow-hidden rounded-lg shadow-lg">
                {slides.map((slide, index) => (
                  <div 
                    key={index}
                    className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img 
                      src={slide.image} 
                      alt={`Advertising slide ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                      <h3 className="text-2xl font-bold">{slide.caption}</h3>
                    </div>
                  </div>
                ))}
                
                {/* Navigation arrows */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 text-white backdrop-blur-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 text-white backdrop-blur-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                
                {/* Slide indicators */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
                  {slides.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide ? "bg-white w-6" : "bg-white/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    ></button>
                  ))}
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-6 text-center">
                <p className="text-gray-700">
                Adorable, healthy pets ready for loving homes! Vaccinated, playful, and well-socialized. 
                Find your perfect furry friend today—bring joy and companionship into your life!
                </p>
                <div className="mt-4 p-3 bg-[#347486]/10 rounded-lg border border-[#347486]/20">
                  <p className="text-[#347486] font-medium">
                  Healthy, playful pets available now! Vaccinated, friendly, and ready to join your loving home today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="w-full lg:w-3/5 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-[#347486]">
              Update Advertisement
            </h2>
            <div className="w-24 h-1 bg-[#BC4626] mx-auto mt-2 rounded-full"></div>
          </div>
        
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center border-l-4 border-red-600">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-gray-700 font-medium mb-2 transition-all">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-3 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all shadow-sm"
                placeholder="Enter advertisement title"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your advertisement"
                className="w-full p-3 h-32 bg-white/80 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all shadow-sm"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all shadow-sm appearance-none"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg width=\"24\" height=\"24\" xmlns=\"http://www.w3.org/2000/svg\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><path d=\"M23.245 4l-11.245 14.374-11.219-14.374-.781.619 12 15.381 12-15.391-.755-.609z\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "15px" }}
              >
                <option value="Service">Service</option>
                <option value="Product">Product</option>
                <option value="Rescue Pet">Rescue Pet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={image_url}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={start_date}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full p-3 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={end_date}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full p-3 bg-white/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>
            
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#BC4626] to-[#CE5A3E] text-white text-lg font-medium rounded-lg hover:from-[#a33d21] hover:to-[#b84e33] transform hover:scale-[1.02] transition-all duration-300 shadow-lg flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Advertisement"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateAdvertisementForm;