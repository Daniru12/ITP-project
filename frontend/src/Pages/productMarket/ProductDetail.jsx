import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  StarIcon,
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
} from 'lucide-react'

export const ProductDetail = () => {
  const { id } = useParams()
  const [selectedTab, setSelectedTab] = useState('description')
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await axios.get(`${backendUrl}/api/Products/${id}`);
        
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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <Link
          to="/petMarketplace"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-xl shadow-sm">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={product.image?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnail Gallery */}
            {product.image && product.image.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.image.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2">
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
            </div>
            <div className="text-3xl font-bold text-gray-900">
              Rs.{product.price}
            </div>
            <div className="space-y-4">
              <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
                <HeartIcon className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
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
        </div>
      </main>
    </div>
  )
}

export default ProductDetail
