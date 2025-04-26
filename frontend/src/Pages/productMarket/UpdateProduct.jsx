import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import mediaUpload from '../../../utils/mediaUpload';

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    //category: 'all',
    image: []
  });
  const [newImages, setNewImages] = useState([]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Quantity validation
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || Number(formData.quantity) < 0 || !Number.isInteger(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a positive whole number';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchProductData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to update products');
        navigate('/login');
        return;
      }

      try {
        // First try to use the product data passed through state
        if (location.state?.product) {
          setFormData(location.state.product);
          setLoading(false);
          return;
        }

        // If no state data, fetch from API
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await axios.get(`${backendUrl}/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          toast.error('Failed to fetch product data');
          navigate('/provider-profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is changed
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleImagesChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = null;
      return;
    }
    setNewImages(files);
    setErrors({ ...errors, images: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('Please login to update products');
      navigate('/login');
      return;
    }

    try {
      let imageUrls = formData.image || [];

      // Upload new images if any
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          try {
            const url = await mediaUpload(newImages[i]);
            imageUrls.push(url);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
            return;
          }
        }
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      await axios.put(`${backendUrl}/api/products/update/${id}`, {
        ...formData,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        image: imageUrls
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Product updated successfully');
      navigate('/delete-product');
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Update Product</h1>
          <Link
            to="/provider-profile"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 
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
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 
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
              Price
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 
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
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 
                ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 
                ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="all">All</option>
              <option value="toys">Toys</option>
              <option value="food">Food</option>
              <option value="accessories">Accessories</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>  */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Images
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {formData.image?.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add New Images (Maximum 5)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 
                ${errors.images ? 'border-red-500' : 'border-gray-300'}`}
            />
            {newImages.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {newImages.length} new image(s) selected
              </p>
            )}
            {errors.images && (
              <p className="mt-1 text-sm text-red-500">{errors.images}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              to="/provider-profile"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
