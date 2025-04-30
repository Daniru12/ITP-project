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
    <div className="min-h-screen bg-[var(--color-white)]">
      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/petMarketplace"
            className="inline-flex items-center text-[var(--color-primary)] hover:text-[var(--color-accent)] mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image Section */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={product.image?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.quantity < 5 && (
                  <div className="absolute top-4 right-4 bg-[var(--color-accent)] text-[var(--text-on-accent)] px-3 py-1 rounded-full text-sm">
                    Only {product.quantity} left!
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.image && product.image.length > 1 && (
                <motion.div 
                  className="grid grid-cols-5 gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {product.image.map((img, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-lg overflow-hidden border border-[var(--color-primary-light)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                <h1 className="text-3xl font-bold text-[var(--text-on-secondary)] mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < (product.rating || 0)
                            ? 'text-[var(--color-secondary)]'
                            : 'text-[var(--text-on-secondary)] opacity-20'
                        }`}
                        fill={i < (product.rating || 0) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[var(--text-on-secondary)] opacity-70">
                    ({product.rating || 0} rating)
                  </span>
                </div>

                <div className="text-3xl font-bold text-[var(--color-primary)] mb-6">
                  Rs.{product.price}
                </div>

                {/* Product Features */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-[var(--text-on-secondary)] opacity-70">
                    <Truck className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[var(--text-on-secondary)] opacity-70">
                    <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>Quality Assured</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-[var(--text-on-secondary)]">Quantity:</span>
                  <div className="flex items-center border border-[var(--color-primary-light)] rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-[var(--color-primary-light)] disabled:opacity-50 text-[var(--text-on-secondary)]"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-x border-[var(--color-primary-light)] py-1 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.quantity}
                      className="p-2 hover:bg-[var(--color-primary-light)] disabled:opacity-50 text-[var(--text-on-secondary)]"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-[var(--text-on-secondary)] opacity-70">
                    {product.quantity} available
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || quantity < 1}
                  className="w-full py-3 px-6 bg-[var(--color-primary)] text-[var(--text-on-primary)] rounded-lg
                    flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-[var(--color-accent)] transition-colors"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8">
            <div className="border-b border-[var(--color-primary-light)]">
              <div className="flex space-x-8">
                <button
                  onClick={() => setSelectedTab('description')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    selectedTab === 'description'
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--text-on-secondary)] hover:text-[var(--color-primary)]'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setSelectedTab('specifications')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    selectedTab === 'specifications'
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--text-on-secondary)] hover:text-[var(--color-primary)]'
                  }`}
                >
                  Specifications
                </button>
              </div>
            </div>
            <div className="py-6">
              {selectedTab === 'description' && (
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-on-secondary)] mb-4">
                    Product Description
                  </h2>
                  <p className="text-[var(--text-on-secondary)] opacity-70 whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
              {selectedTab === 'specifications' && (
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-on-secondary)] mb-4">
                    Specifications
                  </h2>
                  <ul className="divide-y divide-[var(--color-primary-light)]">
                    <li className="py-3 flex justify-between text-[var(--text-on-secondary)] opacity-70">
                      <span>Category</span>
                      <span>{product.category}</span>
                    </li>
                    <li className="py-3 flex justify-between text-[var(--text-on-secondary)] opacity-70">
                      <span>Quantity Available</span>
                      <span>{product.quantity}</span>
                    </li>
                    {product.specifications?.map((spec, idx) => (
                      <li
                        key={idx}
                        className="py-3 flex justify-between text-[var(--text-on-secondary)] opacity-70"
                      >
                        <span>{spec.name}</span>
                        <span>{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default ProductDetail
