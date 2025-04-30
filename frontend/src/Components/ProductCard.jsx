import React, { useState } from 'react'
import { ShoppingCartIcon, HeartIcon, StarIcon, EyeIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showQuantityPopup, setShowQuantityPopup] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    setShowQuantityPopup(true)
  }

  const handleConfirmAddToCart = async () => {
    setIsAdding(true)
    try {
      const token = localStorage.getItem('token')
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success('Added to cart')
      setShowQuantityPopup(false)
      setQuantity(1)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const handleLike = (e) => {
    e.preventDefault()
    setIsLiked(!isLiked)
  }

  const handleView = (e) => {
    e.preventDefault()
    navigate(`/product/${product._id}`)
  }

  if (!product) return null;

  const rating = typeof product.rating === 'number' ? product.rating : 0
  const price = typeof product.price === 'number' ? product.price : 0.0

  return (
    <>
      <Link
        to={`/product/${product._id}`}
        className="block bg-[var(--color-white)] rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      >
        <div className="relative overflow-hidden group">
          <img
            src={product.image?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={product.name || 'Product'}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-1.5 bg-[var(--color-white)] rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
          >
            <HeartIcon
              className={`w-5 h-5 transition-colors duration-300 ${isLiked ? 'text-[var(--color-primary)]' : 'text-[var(--text-on-secondary)] opacity-50'}`}
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 transition-colors duration-300 ${i < rating ? 'text-[var(--color-secondary)]' : 'text-[var(--text-on-secondary)] opacity-30'}`}
                  fill={i < rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-[var(--text-on-secondary)] opacity-70 ml-1">
              ({rating.toFixed(1)})
            </span>
          </div>
          <h3 className="font-medium text-[var(--text-on-secondary)] mb-1 group-hover:text-[var(--color-primary)] transition-colors duration-300">
            {product.name || 'Unnamed Product'}
          </h3>
          <p className="text-sm text-[var(--text-on-secondary)] opacity-70 mb-3 line-clamp-2">
            {product.description || 'No description available.'}
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-[var(--color-primary)]">
              Rs.{price.toFixed(2)}
            </span>
            <div className="flex gap-2">
              {/* <button
                onClick={handleView}
                className="flex items-center justify-center p-2 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <EyeIcon className="w-5 h-5 text-white" />
              </button> */}
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center p-2 rounded-full transition-colors duration-300
                  ${isAdding ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)] hover:bg-[var(--color-accent)]'}`}
              >
                <ShoppingCartIcon className="w-5 h-5 text-[var(--text-on-primary)]" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Quantity Popup */}
      {showQuantityPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-white)] p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--text-on-secondary)] mb-4">Select Quantity</h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-1 rounded-full bg-[var(--color-primary-light)] hover:bg-[var(--color-secondary-light)] text-[var(--text-on-secondary)]"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(product.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center border border-[var(--color-primary-light)] rounded-md px-2 py-1 text-[var(--text-on-secondary)]
                  focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <button 
                onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                className="px-3 py-1 rounded-full bg-[var(--color-primary-light)] hover:bg-[var(--color-secondary-light)] text-[var(--text-on-secondary)]"
              >
                +
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuantityPopup(false)}
                className="px-4 py-2 text-[var(--text-on-secondary)] hover:bg-[var(--color-primary-light)] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                disabled={isAdding}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-primary)] rounded-md 
                  hover:bg-[var(--color-accent)] disabled:opacity-50 transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
