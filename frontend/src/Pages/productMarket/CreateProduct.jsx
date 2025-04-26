import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import mediaUpload from '../../../utils/mediaUpload';

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 
                ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 
                ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              rows="4"
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (LKR)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors({ ...errors, price: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 
                ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors({ ...errors, quantity: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 
                ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors({ ...errors, category: undefined });
              }}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 
                ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="all">All</option>
              <option value="toys">Toys</option>
              <option value="food">Food & Treats</option>
              <option value="beds">Beds & Furniture</option>
              <option value="grooming">Grooming</option>
              <option value="health">Health & Wellness</option>

            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images (Maximum 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-blue-500 
                ${errors.images ? 'border-red-500' : 'border-gray-300'}`}
            />
            {images.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {images.length} image(s) selected
              </p>
            )}
            {errors.images && (
              <p className="mt-1 text-sm text-red-500">{errors.images}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Promo Code Applied
            </label>
            <input
              type="checkbox"
              checked={promoCodeApplied}
              onChange={(e) => setPromoCodeApplied(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 
              ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'}`}
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
