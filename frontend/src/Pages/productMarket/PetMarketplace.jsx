import React, { useState } from 'react'
import { SearchAndCart } from '../../Components/SearchAndCart'
import { ProductGrid } from '../../Components/ProductGrid'
import { FilterBar } from '../../Components/FilterBar'
import { PawPrintIcon, ShoppingCartIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const PetMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Handle search input
  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  // Handle category filter
  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left spacer */}
          <div className="w-6"></div>
          
          {/* Centered title */}
          <div className="flex items-center gap-2">
            <PawPrintIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pet Products</h1>
          </div>
          
          {/* Cart icon */}
          <Link 
            to="/cart" 
            className="p-2 text-gray-600 hover:text-blue-600 relative"
          >
            <ShoppingCartIcon className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8 text-center relative">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 text-lg">
              Find the best products for your furry friends
            </p>
            <div className="absolute left-1/2 transform -translate-x-1/2 h-1 w-24 bg-blue-600 rounded-full mt-4" />
          </div>
        </section>

        {/* Search & Cart */}
        <SearchAndCart onSearch={handleSearch} />

        {/* Filter Categories */}
        <FilterBar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Product Grid */}
        <ProductGrid
          searchQuery={searchQuery}
          activeCategory={activeCategory}
        />
      </main>
    </div>
  )
}

export default PetMarketplace
