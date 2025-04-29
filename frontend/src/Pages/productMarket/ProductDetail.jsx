import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  StarIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  Truck,
  Shield,
  Package,
  BadgeCheck,
  Zap,
  MinusIcon,
  PlusIcon
} from 'lucide-react'
import { motion } from 'framer-motion'

export const ProductDetail = () => {
  const { id } = useParams()
  const [selectedTab, setSelectedTab] = useState('description')
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await axios.get(`${backendUrl}/api/products/details/${id}`);
        
        if (!response.data) {
          throw new Error('Product not found');
        }
        
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product details');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (newQuantity) => {
    // Ensure quantity is within valid range
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL

      await axios.post(
        `${backendUrl}/api/cart/add`,
        {
          productId: product._id,
          quantity: quantity
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      toast.success('Added to cart successfully')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Product not found'}</p>
          <Link
            to="/petMarketplace"
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/petMarketplace"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-lg">
            {/* Product Image Section */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl group">
                <img
                  src={product.image?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                {product.quantity < 5 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Only {product.quantity} left!
                  </div>
                )}
              </div>

              {/* Enhanced Thumbnail Gallery */}
              {product.image && product.image.length > 1 && (
                <motion.div 
                  className="grid grid-cols-5 gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {product.image.map((img, index) => (
                    <motion.div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Product Info Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < (product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill={i < (product.rating || 0) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.rating || 0} rating)
                  </span>
                </div>

                {/* Price Section with Animation */}
                <motion.div 
                  className="text-4xl font-bold text-blue-600 mb-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Rs.{product.price}
                </motion.div>

                {/* Product Features */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span>Quality Assured</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Package className="w-5 h-5 text-blue-500" />
                    <span>Secure Packaging</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BadgeCheck className="w-5 h-5 text-blue-500" />
                    <span>Verified Product</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-gray-700">Quantity:</span>
                  <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </motion.button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-x py-1 focus:outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.quantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.quantity} available
                  </span>
                </div>

                {/* Add to Cart Button */}
                <motion.button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || quantity < 1}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
                    flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
                    hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span className="font-medium">{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                  <Zap className="w-5 h-5 ml-2" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Tabs Section */}
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="border-b border-gray-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setSelectedTab('description')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    selectedTab === 'description'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSelectedTab('specifications')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    selectedTab === 'specifications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Specifications
                </button>
              </div>
            </div>
            <div className="p-6">
              {selectedTab === 'description' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Product Description
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
              {selectedTab === 'specifications' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Specifications
                  </h2>
                  <ul className="divide-y divide-gray-200">
                    <li className="py-3 flex justify-between text-gray-700">
                      <span>Category</span>
                      <span>{product.category}</span>
                    </li>
                    <li className="py-3 flex justify-between text-gray-700">
                      <span>Quantity Available</span>
                      <span>{product.quantity}</span>
                    </li>
                    {product.specifications?.map((spec, idx) => (
                      <li
                        key={idx}
                        className="py-3 flex justify-between text-gray-700"
                      >
                        <span>{spec.name}</span>
                        <span>{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default ProductDetail
