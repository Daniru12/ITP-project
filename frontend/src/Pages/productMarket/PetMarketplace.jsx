import React, { useState, useEffect } from 'react'
import { SearchAndCart } from '../../Components/SearchAndCart'
import { ProductGrid } from '../../Components/ProductGrid'
import { FilterBar } from '../../Components/FilterBar'
import { 
  PawPrintIcon, 
  ShoppingCartIcon, 
  PackageIcon, 
  Sparkles,
  Heart,
  TrendingUp,
  Star,
  ShieldCheck,
  Truck,
  Clock,
  Search,
  SlidersHorizontal,
  AlertCircle,
  ShoppingBagIcon,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const NoProductsFound = ({ category }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl shadow-md p-8 text-center"
  >
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Shopping bag icon in gray */}
      <div className="w-24 h-24 mb-2">
        <ShoppingBagIcon className="w-full h-full text-gray-300" />
      </div>
      
      <h3 className="text-xl font-medium text-gray-900">
        No {category === 'all' ? 'Products' : `${category}`} orders found
      </h3>
      
      <p className="text-gray-500 max-w-md">
        {category === 'all' 
          ? "Looks like there are no products available at the moment"
          : `Looks like there are no products in the ${category} category yet`
        }
      </p>

      <Link to="/products">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </motion.button>
      </Link>
    </div>
  </motion.div>
);

const PetMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userType, setUserType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Get user type from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const type = userData.user_type || '';
    console.log('Current user type:', type); // Debug log
    setUserType(type);
    fetchProducts()
  }, [])

  useEffect(() => {
    if (activeCategory) {
      fetchProducts();
    }
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      let url;
      
      if (activeCategory === 'all') {
        url = `${backendUrl}/api/products/all`;
      } else {
        url = `${backendUrl}/api/products/category/${activeCategory}`;
      }

      console.log('Fetching products from:', url); // Debug log
      const response = await axios.get(url);
      console.log('Response:', response.data); // Debug log
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error details:', error.response || error);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

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

  // Update the categories array with simplified values
  const categories = [
    { name: 'All Products', value: 'all' },
    { name: 'Food & Treats', value: 'food' },
    { name: 'Toys', value: 'toys' },
    { name: 'Beds & Furniture', value: 'beds' },
    { name: 'Grooming', value: 'grooming' },
    { name: 'Health & Wellness', value: 'health' }
  ];

  // Update the handleCategoryChange function
  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      let url;
      
      if (category === 'all') {
        url = `${backendUrl}/api/products/all`;
      } else {
        url = `${backendUrl}/api/products/category/${category.toLowerCase()}`;
      }

      const response = await axios.get(url);
      setProducts(response.data);
      
      // Simply set no_products state if array is empty, without any error toast
      if (response.data.length === 0) {
        setError('no_products');
      } else {
        setError(null);
      }
    } catch (error) {
      // Only show error toast for actual API failures, not for empty categories
      console.error('Debug - Error response:', error.response);
      setError('error');
      toast.error('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkCategories = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${backendUrl}/api/products/categories`);
      console.log('Available categories:', response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    checkCategories();
  }, []);

  useEffect(() => {
    // Debug function to check API endpoints
    const debugAPI = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      try {
        console.log('Debug - Testing API endpoints:');
        
        // Test all products endpoint
        const allResponse = await axios.get(`${backendUrl}/api/products/all`);
        console.log('All products count:', allResponse.data.length);
        
        // Test toys category
        const toysResponse = await axios.get(`${backendUrl}/api/products/category/toys`);
        console.log('Toys category response:', toysResponse.data);
        
      } catch (error) {
        console.error('Debug - API test failed:', error.response || error);
      }
    };
    
    debugAPI();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <PawPrintIcon className="w-16 h-16 text-blue-600" />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (error && error !== 'no_products') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">Something went wrong</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchProducts}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium
              hover:bg-blue-700 transition-colors shadow-md"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header with corner icons */}
      <header className="bg-white shadow-lg relative z-10 py-4">
        <div className="container mx-auto px-4">
          {/* Corner Icons */}
          <div className="absolute right-4 top-4 flex items-center gap-3">
            <Link to="/cart" className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl 
                  group-hover:from-blue-100 group-hover:to-indigo-100 transition-all shadow-sm"
              >
                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 
                  rounded-full flex items-center justify-center shadow-md">
                  0
                </span>
              </motion.div>
            </Link>
            <Link to="/orders" className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl 
                  group-hover:from-blue-100 group-hover:to-indigo-100 transition-all shadow-sm"
              >
                <PackageIcon className="w-5 h-5 text-blue-600" />
              </motion.div>
            </Link>
          </div>

          {/* Centered Logo and Title */}
          <div className="flex justify-center items-center">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md"
              >
                <PawPrintIcon className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Pet Products
              </h1>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Features Section */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-2xl shadow-md flex items-center gap-4"
            >
              <div className="bg-blue-100 p-3 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-gray-500">2-3 business days</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-2xl shadow-md flex items-center gap-4"
            >
              <div className="bg-green-100 p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Quality Assured</h3>
                <p className="text-sm text-gray-500">100% genuine products</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-2xl shadow-md flex items-center gap-4"
            >
              <div className="bg-purple-100 p-3 rounded-xl">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Best Selection</h3>
                <p className="text-sm text-gray-500">Curated products</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-4 rounded-2xl shadow-md flex items-center gap-4"
            >
              <div className="bg-orange-100 p-3 rounded-xl">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Pet Approved</h3>
                <p className="text-sm text-gray-500">Tested & loved</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Improved Search and Filter Section */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Search Bar with Filter Icon */}
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <SearchAndCart 
                    onSearch={handleSearch} 
                    showCart={false} 
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl transition-all ${
                    showFilters 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Collapsible Filter Section */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {categories.map((category) => (
                        <motion.button
                          key={category.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCategoryChange(category.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            activeCategory === category.value
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Stats */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">
                    {products.length} products found
                  </span>
                </div>
                {activeCategory !== 'all' && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">
                      Category: {activeCategory}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Product Grid */}
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="min-h-[400px]"
        >
          {error === 'no_products' ? (
            <NoProductsFound category={activeCategory} />
          ) : (
            <ProductGrid
              products={products}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              showAddToCart={true}
              userType={userType}
            />
          )}
        </motion.section>

        {/* Enhanced Footer Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mt-12 overflow-hidden"
        >
          <div className="container mx-auto px-6 py-8 relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 opacity-10"
            >
              <PawPrintIcon className="w-32 h-32 text-white" />
            </motion.div>
            
            <div className="text-center relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">
                Your Pet's Happiness, Our Priority
              </h3>
              <p className="text-blue-100 text-sm">
                Shop the best products for your furry friends
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-full font-medium text-sm
                  hover:bg-blue-50 transition-colors shadow-md"
              >
                Explore More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default PetMarketplace
