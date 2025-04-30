import React, { useState, useEffect } from 'react'
import { SearchAndCart } from '../../Components/SearchAndCart'
import { ProductGrid } from '../../Components/ProductGrid'
import { FilterBar } from '../../Components/FilterBar'
import { PawPrintIcon, ShoppingCartIcon, PackageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const PetMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userType, setUserType] = useState('')

  useEffect(() => {
    // Get user type from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const type = userData.user_type || '';
    console.log('Current user type:', type); // Debug log
    setUserType(type);
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      let url = `${backendUrl}/api/products/all`
      
      if (activeCategory !== 'all') {
        url = `${backendUrl}/api/products/category/${activeCategory}`
      }

      const response = await axios.get(url)
      setProducts(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Handle search input
  const handleSearch = async (query) => {
    setSearchQuery(query)
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      const response = await axios.get(`${backendUrl}/api/products/search?query=${query}`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  // Handle category filter
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2">
              <PawPrintIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Pet Products</h1>
            </div>
          </div>
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
            <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600 relative">
              <ShoppingCartIcon className="w-6 h-6" />
            </Link>
            <Link to="/orders" className="p-2 text-gray-600 hover:text-blue-600 relative">
              <PackageIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-8 text-center relative">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 text-lg">
              Find the best products for your furry friends
            </p>
            <div className="absolute left-1/2 transform -translate-x-1/2 h-1 w-24 bg-blue-600 rounded-full mt-4" />
          </div>
        </section>

        <SearchAndCart 
          onSearch={handleSearch} 
          showCart={true} 
        />

        <FilterBar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <ProductGrid
          products={products}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          showAddToCart={true}
          userType={userType}
        />
      </main>
    </div>
  )
}

export default PetMarketplace
