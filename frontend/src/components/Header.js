import React from 'react';
import { ShoppingCart, Search, Menu } from 'react-feather';

function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold text-gray-800">
          EcoShop
        </a>
        <div className="hidden md:flex space-x-4">
          <a href="/products" className="text-gray-600 hover:text-gray-800">Products</a>
          <a href="/categories" className="text-gray-600 hover:text-gray-800">Categories</a>
          <a href="/about" className="text-gray-600 hover:text-gray-800">About</a>
          <a href="/contact" className="text-gray-600 hover:text-gray-800">Contact</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-800">
            <Search className="h-6 w-6" />
          </button>
          <button className="text-gray-600 hover:text-gray-800">
            <ShoppingCart className="h-6 w-6" />
          </button>
          <button className="md:hidden text-gray-600 hover:text-gray-800">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

