import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, Edit2, Trash2, Eye, DollarSign, Tag, ShoppingBag, TrendingUp, AlertTriangle, Plus } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    categories: {},
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your products');
      navigate('/login');
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      console.log('Fetching from:', `${backendUrl}/api/products/own`);
      
      const response = await axios.get(`${backendUrl}/api/products/own`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response:', response.data);

      if (response.data) {
        setProducts(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Detailed fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(
          error.response?.data?.message || 
          'Failed to fetch products. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products) => {
    const stats = {
      totalProducts: products.length,
      totalValue: 0,
      categories: {},
      lowStock: 0
    };

    products.forEach(product => {
      stats.totalValue += product.price * product.quantity;
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
      if (product.quantity < 10) stats.lowStock++;
    });

    setStats(stats);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.delete(`${backendUrl}/api/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Dashboard</h1>
          <p className="text-gray-600">Manage your product inventory and track performance</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              <p className="ml-2 text-sm text-green-500">Active Items</p>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">Rs.{stats.totalValue.toFixed(2)}</p>
              <p className="ml-2 text-sm text-green-500">In Stock</p>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Tag className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-purple-500 text-sm font-medium">Active</div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">{Object.keys(stats.categories).length}</p>
              <p className="ml-2 text-sm text-purple-500">Types</p>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-red-500 text-sm font-medium">Alert</div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Low Stock Items</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">{stats.lowStock}</p>
              <p className="ml-2 text-sm text-red-500">Need Attention</p>
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
            <Link
              to="/create-product"
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Add Product</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img 
                            className="h-12 w-12 rounded-lg object-cover shadow-sm" 
                            src={product.image[0]} 
                            alt="" 
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.description.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        Rs.{product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                        ${product.quantity < 10 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                        }`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-4">
                        <Link 
                          to={`/product/${product._id}`}
                          className="text-blue-600 hover:text-blue-900 transition duration-150"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/update-product/${product._id}`}
                          className="text-yellow-600 hover:text-yellow-900 transition duration-150"
                        >
                          <Edit2 className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 transition duration-150"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement; 