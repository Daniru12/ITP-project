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
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent-light)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-on-secondary)]">Create New Product</h1>
            <p className="text-sm text-[var(--text-on-secondary)] opacity-70 mt-1">Add your product details below</p>
          </div>
          <button
            onClick={() => navigate('/product-management')}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--color-white)] shadow-sm hover:shadow-md transition-all duration-300 text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] border border-[var(--color-primary-light)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form Section */}
          <div className="flex-1 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-6 border-b border-[var(--color-primary-light)]">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center mr-3">
                    <Package className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-on-secondary)]">Basic Information</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-primary-light)] border-2 border-[var(--color-primary-light)] focus:border-[var(--color-primary)] focus:bg-[var(--color-white)] focus:ring-0 transition-all duration-300"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors({ ...errors, description: undefined });
                    }}
                    placeholder="Describe your product in detail..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-primary-light)] border-2 border-[var(--color-primary-light)] focus:border-[var(--color-primary)] focus:bg-[var(--color-white)] focus:ring-0 transition-all duration-300"
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-6 border-b border-[var(--color-primary-light)]">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center mr-3">
                    <DollarSign className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-on-secondary)]">Pricing & Inventory</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">Price (LKR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-on-secondary)] opacity-70">Rs.</span>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          setErrors({ ...errors, price: undefined });
                        }}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-primary-light)] border-2 border-[var(--color-primary-light)] focus:border-[var(--color-accent)] focus:bg-[var(--color-white)] focus:ring-0 transition-all duration-300 text-lg font-semibold text-[var(--text-on-secondary)]"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        setErrors({ ...errors, quantity: undefined });
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-primary-light)] border-2 border-[var(--color-primary-light)] focus:border-[var(--color-accent)] focus:bg-[var(--color-white)] focus:ring-0 transition-all duration-300 text-lg font-semibold text-[var(--text-on-secondary)]"
                    />
                    {errors.quantity && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <span className="h-1 w-1 rounded-full bg-red-500 mr-2"></span>
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 space-y-6">
            {/* Category Card */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-6 border-b border-[var(--color-primary-light)]">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-xl bg-[var(--color-secondary-light)] flex items-center justify-center mr-3">
                    <Tag className="h-5 w-5 text-[var(--color-secondary)]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-on-secondary)]">Category</h2>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {['all', 'toys', 'food', 'beds', 'grooming', 'health'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 
                        ${category === cat 
                          ? 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] border-2 border-[var(--color-secondary)]' 
                          : 'bg-[var(--color-primary-light)] text-[var(--text-on-secondary)] border-2 border-[var(--color-primary-light)] hover:bg-[var(--color-primary)] hover:text-[var(--text-on-primary)]'
                        }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Upload Card */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-6 border-b border-[var(--color-primary-light)]">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center mr-3">
                    <ImageIcon className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-on-secondary)]">Product Images</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="border-2 border-dashed border-[var(--color-primary-light)] rounded-xl p-6 text-center bg-[var(--color-primary-light)]">
                  <ImageIcon className="mx-auto h-10 w-10 text-[var(--text-on-secondary)] opacity-50 mb-4" />
                  <div className="space-y-3">
                    <label className="cursor-pointer block">
                      <span className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium hover:bg-[var(--color-accent)] hover:text-[var(--text-on-primary)] transition-colors duration-300">
                        <ImageIcon className="h-4 w-4 mr-2" />
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
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">or drag and drop</p>
                    <p className="text-xs text-[var(--text-on-secondary)] opacity-50">PNG, JPG or JPEG (MAX. 5 images)</p>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-4 py-2 px-3 bg-[var(--color-accent-light)] rounded-lg inline-flex items-center">
                      <ImageIcon className="h-4 w-4 text-[var(--color-accent)] mr-2" />
                      <span className="text-sm text-[var(--color-accent)] font-medium">
                        {images.length} image(s) selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <label className="flex items-center space-x-3 cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={promoCodeApplied}
                    onChange={(e) => setPromoCodeApplied(e.target.checked)}
                    className="w-4 h-4 text-[var(--color-primary)] rounded-lg border-[var(--color-primary-light)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-[var(--text-on-secondary)]">Enable Promo Code</span>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-[var(--text-on-primary)] font-medium text-sm
                    ${isSubmitting 
                      ? 'bg-[var(--text-on-secondary)] opacity-50 cursor-not-allowed' 
                      : 'bg-[var(--color-primary)] hover:bg-[var(--color-accent)] shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300'
                    }`}
                >
                  <Save className="w-4 h-4 mr-2" />
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
