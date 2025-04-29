import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import mediaUpload from '../../../utils/mediaUpload';
import { 
  Package, 
  FileText, 
  DollarSign, 
  Hash, 
  Tag, 
  Image as ImageIcon,
  Percent,
  ArrowLeft,
  Save
} from 'lucide-react';

const CreateProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('all');
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Price validation
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Quantity validation
    if (!quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Quantity must be a positive whole number';
    }

    // Category validation
    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleImagesChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = null;
      return;
    }
    setImages(files);
    setErrors({ ...errors, images: undefined });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    // Get the token from localStorage
    const token = localStorage.getItem('token');

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
          setIsSubmitting(false);
          return;
        }
      }

      // Create request body
      const data = {
        name,
        description,
        price: Number(price),
        quantity: Number(quantity),
        category,
        promo_code_applied: promoCodeApplied ? 'true' : 'false',
        image: imageUrls
      };

      // Get the backend URL
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      // Send POST request to the backend
      await axios.post(`${backendUrl}/api/products/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Show success message and redirect
      toast.success('Product created successfully!');
      navigate('/petMarketplace');
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Product</h1>
            <p className="text-gray-600">Bring your product to life</p>
          </div>
          <button
            onClick={() => navigate('/product-management')}
            className="flex items-center bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-blue-600">Back to Products</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <Package className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
              </div>
              
              <div className="space-y-6">
                {/* Product Name Input */}
                <div className="bg-gray-50 p-4 rounded-xl transition-all duration-300 hover:bg-gray-100">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Product Name"
                    className="w-full bg-transparent border-none text-lg font-medium focus:ring-0 placeholder-gray-400"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-2">{errors.name}</p>
                  )}
                </div>

                {/* Description Input */}
                <div className="bg-gray-50 p-4 rounded-xl transition-all duration-300 hover:bg-gray-100">
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors({ ...errors, description: undefined });
                    }}
                    placeholder="Describe your product..."
                    rows="4"
                    className="w-full bg-transparent border-none text-base focus:ring-0 placeholder-gray-400"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-2">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Pricing & Inventory</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Price Input */}
                <div className="bg-gray-50 p-4 rounded-xl transition-all duration-300 hover:bg-gray-100">
                  <label className="text-sm text-gray-500 block mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors({ ...errors, price: undefined });
                    }}
                    className="w-full bg-transparent border-none text-2xl font-bold focus:ring-0 text-green-600"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-2">{errors.price}</p>
                  )}
                </div>

                {/* Quantity Input */}
                <div className="bg-gray-50 p-4 rounded-xl transition-all duration-300 hover:bg-gray-100">
                  <label className="text-sm text-gray-500 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setErrors({ ...errors, quantity: undefined });
                    }}
                    className="w-full bg-transparent border-none text-2xl font-bold focus:ring-0"
                    placeholder="0"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500 mt-2">{errors.quantity}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* Category Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <Tag className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Category</h2>
              </div>
              
              <div className="space-y-3">
                {['all', 'toys', 'food', 'beds', 'grooming', 'health'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 
                      ${category === cat 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'hover:bg-gray-50'}`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <ImageIcon className="w-6 h-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Product Images</h2>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <label className="cursor-pointer">
                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors duration-300">
                      Choose Files
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                  <p className="text-xs text-gray-400">Maximum 5 images</p>
                </div>
                {images.length > 0 && (
                  <p className="mt-4 text-sm text-blue-600 font-medium">
                    {images.length} image(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoCodeApplied}
                    onChange={(e) => setPromoCodeApplied(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Enable Promo Code</span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold
                    ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300'
                    }`}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Publish Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
