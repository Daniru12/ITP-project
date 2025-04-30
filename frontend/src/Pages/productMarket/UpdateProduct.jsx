import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import mediaUpload from '../../../utils/mediaUpload';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Image as ImageIcon,
  Package,
  DollarSign,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

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
          console.log('Product data from state:', location.state.product);
          setFormData(location.state.product);
          setLoading(false);
          return;
        }

        // If no state data, fetch from API
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await axios.get(`${backendUrl}/api/products/management/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          console.log('Product data from API:', response.data);
          // Ensure image array is properly formatted
          const formattedData = {
            ...response.data,
            image: Array.isArray(response.data.image) ? response.data.image : []
          };
          setFormData(formattedData);
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
      navigate('/product-management');
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
      <div className="min-h-screen bg-[var(--color-primary-light)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent-light)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/product-management"
            className="p-2 rounded-full bg-[var(--color-white)] shadow-sm hover:bg-[var(--color-primary-light)] transition-colors duration-200 mr-4"
          >
            <ArrowLeft className="h-6 w-6 text-[var(--text-on-secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-on-secondary)]">Update Product</h1>
            <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Make changes to your product information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="inline-flex px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-medium">
                  <Package className="h-5 w-5 mr-2" />
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 
                    ${errors.name 
                      ? 'border-red-200 bg-red-50 focus:border-red-500' 
                      : 'border-[var(--color-primary-light)] focus:border-[var(--color-primary)] hover:border-[var(--color-primary-light)]'
                    }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="flex items-center text-sm text-red-500 px-4">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="inline-flex px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-sm font-medium">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-on-secondary)] opacity-70">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 
                      ${errors.price 
                        ? 'border-red-200 bg-red-50 focus:border-red-500' 
                        : 'border-[var(--color-primary-light)] focus:border-[var(--color-accent)] hover:border-[var(--color-primary-light)]'
                      }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="flex items-center text-sm text-red-500 px-4">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="inline-flex px-3 py-1 rounded-full bg-[var(--color-secondary-light)] text-[var(--color-secondary)] text-sm font-medium">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 min-h-[120px]
                    ${errors.description 
                      ? 'border-red-200 bg-red-50 focus:border-red-500' 
                      : 'border-[var(--color-primary-light)] focus:border-[var(--color-secondary)] hover:border-[var(--color-primary-light)]'
                    }`}
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="flex items-center text-sm text-red-500 px-4">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="inline-flex px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-sm font-medium">
                  <Hash className="h-5 w-5 mr-2" />
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-0 
                    ${errors.quantity 
                      ? 'border-red-200 bg-red-50 focus:border-red-500' 
                      : 'border-[var(--color-primary-light)] focus:border-[var(--color-accent)] hover:border-[var(--color-primary-light)]'
                    }`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="flex items-center text-sm text-red-500 px-4">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                <ImageIcon className="h-5 w-5 mr-2 text-[var(--color-primary)]" />
                Current Images
              </label>
              <span className="text-sm text-[var(--text-on-secondary)] opacity-70">
                {formData.image?.length || 0} of 5 images
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.image && formData.image.length > 0 ? (
                formData.image.map((img, index) => (
                  <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--color-white)] border-2 border-[var(--color-primary-light)] hover:border-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        console.error('Image load error for:', img);
                        e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                        toast.error(`Failed to load image ${index + 1}`);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-white)] text-sm">Image {index + 1}</span>
                          <button
                            onClick={() => {
                              const newImages = [...formData.image];
                              newImages.splice(index, 1);
                              setFormData(prev => ({ ...prev, image: newImages }));
                              toast.success('Image removed');
                            }}
                            className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-[var(--color-white)] transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--color-primary-light)] rounded-xl bg-[var(--color-primary-light)]">
                  <ImageIcon className="h-12 w-12 text-[var(--text-on-secondary)] opacity-50 mb-3" />
                  <p className="text-[var(--text-on-secondary)] opacity-70 text-sm text-center">No images uploaded yet</p>
                  <p className="text-[var(--text-on-secondary)] opacity-50 text-xs text-center mt-1">Images will appear here once uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview for new images */}
          {newImages.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--text-on-secondary)] flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-[var(--color-accent)]" />
                  New Images Preview
                </h3>
                <button
                  onClick={() => {
                    setNewImages([]);
                    const input = document.querySelector('input[type="file"]');
                    if (input) input.value = '';
                  }}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Selection
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from(newImages).map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--color-white)] border-2 border-[var(--color-accent-light)] shadow-sm">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New upload ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                      onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 p-2">
                      <p className="text-[var(--color-white)] text-sm text-center">New Image {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div className="mt-6">
            <div className="flex items-center justify-center w-full">
              <label 
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 rounded-xl transition-all duration-200 ${
                  formData.image && formData.image.length >= 5 
                    ? 'border-[var(--color-primary-light)] bg-[var(--color-primary-light)] cursor-not-allowed' 
                    : 'border-[var(--color-primary)] border-dashed bg-[var(--color-primary-light)] cursor-pointer hover:bg-[var(--color-primary-light)]'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className={`h-8 w-8 mb-2 ${
                    formData.image && formData.image.length >= 5 
                      ? 'text-[var(--text-on-secondary)] opacity-50' 
                      : 'text-[var(--color-primary)]'
                  }`} />
                  <p className="mb-2 text-sm text-[var(--text-on-secondary)]">
                    {formData.image && formData.image.length >= 5 ? (
                      <span>Maximum number of images reached</span>
                    ) : (
                      <>
                        <span className="font-semibold text-[var(--color-primary)]">Click to upload</span>
                        <span className="text-[var(--text-on-secondary)] opacity-70"> or drag and drop</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-on-secondary)] opacity-50">
                    PNG, JPG or JPEG (MAX. {5 - (formData.image?.length || 0)} remaining)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                  disabled={formData.image && formData.image.length >= 5}
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/product-management"
              className="px-6 py-3 border-2 border-[var(--color-primary-light)] rounded-xl text-[var(--text-on-secondary)] hover:bg-[var(--color-primary-light)] font-medium transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border-2 border-[var(--color-primary)] rounded-xl font-medium text-[var(--text-on-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors duration-200"
            >
              <Save className="h-5 w-5 mr-2" />
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
