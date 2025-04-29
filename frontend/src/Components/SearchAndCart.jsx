import React, { useState } from 'react'
import { SearchIcon } from 'lucide-react'   // search to do and cart to do

export const SearchAndCart = ({ onSearch, showCart }) => {
  const [searchValue, setSearchValue] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchValue)
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for pet products..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <SearchIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </form>
    </div>
  )
}