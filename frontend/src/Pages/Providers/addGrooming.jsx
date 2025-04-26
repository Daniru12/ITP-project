import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import mediaUpload from "../../../utils/mediaUpload";
import HamsterLoader from "../../components/HamsterLoader";

const AddGrooming = () => {
  const navigate = useNavigate();
  
  // Add loading state and images state
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  
  // Simplified initial state with clear naming
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // Create separate state for each package to make it easier to understand
  const [basicPackage, setBasicPackage] = useState({
    price: "",
    duration: "",
    includes: [""]
  });
  
  const [premiumPackage, setPremiumPackage] = useState({
    price: "",
    duration: "",
    includes: [""]
  });
  
  const [luxuryPackage, setLuxuryPackage] = useState({
    price: "",
    duration: "",
    includes: [""]
  });
  
  // Simplified handlers for each input type
  const handleServiceNameChange = (e) => {
    setServiceName(e.target.value);
  };
  
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };
  
  // Handle price change with more descriptive function name
  const handleBasicPriceChange = (e) => {
    setBasicPackage({...basicPackage, price: e.target.value});
  };
  
  const handlePremiumPriceChange = (e) => {
    setPremiumPackage({...premiumPackage, price: e.target.value});
  };
  
  const handleLuxuryPriceChange = (e) => {
    setLuxuryPackage({...luxuryPackage, price: e.target.value});
  };
  
  // Handle duration change
  const handleBasicDurationChange = (e) => {
    setBasicPackage({...basicPackage, duration: e.target.value});
  };
  
  const handlePremiumDurationChange = (e) => {
    setPremiumPackage({...premiumPackage, duration: e.target.value});
  };
  
  const handleLuxuryDurationChange = (e) => {
    setLuxuryPackage({...luxuryPackage, duration: e.target.value});
  };
  
  // Handle included services changes with more descriptive function names
  const handleBasicServiceChange = (index, value) => {
    const updatedServices = [...basicPackage.includes];
    updatedServices[index] = value;
    setBasicPackage({...basicPackage, includes: updatedServices});
  };
  
  const handlePremiumServiceChange = (index, value) => {
    const updatedServices = [...premiumPackage.includes];
    updatedServices[index] = value;
    setPremiumPackage({...premiumPackage, includes: updatedServices});
  };
  
  const handleLuxuryServiceChange = (index, value) => {
    const updatedServices = [...luxuryPackage.includes];
    updatedServices[index] = value;
    setLuxuryPackage({...luxuryPackage, includes: updatedServices});
  };
  
  // Add service field functions
  const addBasicServiceField = () => {
    setBasicPackage({
      ...basicPackage,
      includes: [...basicPackage.includes, ""]
    });
  };
  
  const addPremiumServiceField = () => {
    setPremiumPackage({
      ...premiumPackage,
      includes: [...premiumPackage.includes, ""]
    });
  };
  
  const addLuxuryServiceField = () => {
    setLuxuryPackage({
      ...luxuryPackage,
      includes: [...luxuryPackage.includes, ""]
    });
  };
  
  // Remove service field functions
  const removeBasicServiceField = (index) => {
    const updatedServices = basicPackage.includes.filter((_, i) => i !== index);
    setBasicPackage({...basicPackage, includes: updatedServices});
  };
  
  const removePremiumServiceField = (index) => {
    const updatedServices = premiumPackage.includes.filter((_, i) => i !== index);
    setPremiumPackage({...premiumPackage, includes: updatedServices});
  };
  
  const removeLuxuryServiceField = (index) => {
    const updatedServices = luxuryPackage.includes.filter((_, i) => i !== index);
    setLuxuryPackage({...luxuryPackage, includes: updatedServices});
  };
  
  // Add image change handler
  const handleImagesChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = null;
      return;
    }
    setImages(files);
  };
  
  // Add validation function before handleSubmit
  const validateForm = () => {
    // Check service name
    if (!serviceName.trim()) {
      toast.error("Service name is required");
      return false;
    }
    if (serviceName.length < 3) {
      toast.error("Service name must be at least 3 characters long");
      return false;
    }

    // Check description
    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (description.length < 10) {
      toast.error("Description must be at least 10 characters long");
      return false;
    }

    // Check location
    if (!location.trim()) {
      toast.error("Location is required");
      return false;
    }
    if (!location.includes(",")) {
      toast.error("Location should include city (e.g., 123 Pet Street, City)");
      return false;
    }

    // Check images
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return false;
    }

    // Validate packages
    const packages = {
      basic: basicPackage,
      premium: premiumPackage,
      luxury: luxuryPackage
    };

    for (const [tier, package_] of Object.entries(packages)) {
      // Check price
      if (!package_.price || Number(package_.price) <= 0) {
        toast.error(`${tier} package price must be greater than 0`);
        return false;
      }

      // Check duration
      if (!package_.duration || Number(package_.duration) < 15) {
        toast.error(`${tier} package duration must be at least 15 minutes`);
        return false;
      }

      // Check included services
      if (package_.includes.length === 0 || package_.includes.some(service => !service.trim())) {
        toast.error(`${tier} package must include at least one service`);
        return false;
      }
    }

    return true;
  };
  
  // Update form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Run validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Upload images to Supabase
      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        try {
          const url = await mediaUpload(images[i]);
          imageUrls.push(url);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Error uploading image");
          setIsLoading(false);
          return;
        }
      }
    
      // Reconstruct the data in the format expected by the API
      const formData = {
        service_name: serviceName,
        service_category: "pet_grooming",
        description: description,
        location: location,
        image: imageUrls, // Send array of image URLs
        packages: {
          basic: basicPackage,
          premium: premiumPackage,
          luxury: luxuryPackage
        }
      };
      
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      await axios.post(`${backendUrl}/api/grooming/service`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Service added successfully!");
      navigate("/provider-profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add service");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <HamsterLoader />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-secondary-light)]">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-on-secondary)] mb-4">
                Add Grooming Service
              </h1>
              <p className="text-lg text-[var(--text-on-secondary)] opacity-80">
                Create a new grooming service for your pet care business
              </p>
            </div>
            <Link
              to="/add-service"
              className="flex items-center text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Services
            </Link>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Information Card */}
          <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[var(--color-primary-light)] p-3 rounded-xl">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--text-on-secondary)]">Service Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={handleServiceNameChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="e.g., Premium Pet Grooming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  rows="4"
                  placeholder="Describe your grooming service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="e.g., 123 Pet Street, City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                  Service Images
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagesChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">
                      Click to upload images (max 5)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Package */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[var(--color-secondary-light)] p-2 rounded-lg">
                  <span className="text-[var(--color-secondary)]">💰</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-on-secondary)]">Basic Package</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    value={basicPackage.price}
                    onChange={handleBasicPriceChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={basicPackage.duration}
                    onChange={handleBasicDurationChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Duration in minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Services Included</label>
                  {basicPackage.includes.map((service, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => handleBasicServiceChange(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        placeholder="Service included"
                      />
                      {basicPackage.includes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBasicServiceField(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBasicServiceField}
                    className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm mt-2 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Service
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Package */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[var(--color-accent-light)] p-2 rounded-lg">
                  <span className="text-[var(--color-accent)]">✨</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-on-secondary)]">Premium Package</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    value={premiumPackage.price}
                    onChange={handlePremiumPriceChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={premiumPackage.duration}
                    onChange={handlePremiumDurationChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Duration in minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Services Included</label>
                  {premiumPackage.includes.map((service, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => handlePremiumServiceChange(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        placeholder="Service included"
                      />
                      {premiumPackage.includes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePremiumServiceField(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPremiumServiceField}
                    className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm mt-2 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Service
                  </button>
                </div>
              </div>
            </div>

            {/* Luxury Package */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[var(--color-primary-light)] p-2 rounded-lg">
                  <span className="text-[var(--color-primary)]">👑</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-on-secondary)]">Luxury Package</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    value={luxuryPackage.price}
                    onChange={handleLuxuryPriceChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={luxuryPackage.duration}
                    onChange={handleLuxuryDurationChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="Duration in minutes"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-on-secondary)] mb-1">Services Included</label>
                  {luxuryPackage.includes.map((service, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => handleLuxuryServiceChange(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        placeholder="Service included"
                      />
                      {luxuryPackage.includes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLuxuryServiceField(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLuxuryServiceField}
                    className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm mt-2 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-[var(--text-on-primary)] px-8 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Service...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGrooming;