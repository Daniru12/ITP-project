import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  Edit2, 
  Trash2, 
  Eye, 
  DollarSign, 
  Tag, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Search,
  X,
  ChevronRight,
  Star,
  Clock,
  Calendar
} from 'lucide-react';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    categories: {},
    lowStock: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view products');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.get(`${backendUrl}/api/products/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setProducts(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
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

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (id) => {
    navigate(`/update-product/${id}`);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage all products in the system</p>
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

        {/* Search and Add Product Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products List Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                {filteredProducts.map((product) => (
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
                        <button 
                          onClick={() => handleViewDetails(product)}
                          className="text-blue-600 hover:text-blue-900 transition duration-150"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Details Modal */}
        {showModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition duration-150"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Product Images */}
                <div className="space-y-4">
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <img 
                      src={selectedProduct.image[0]} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.image.map((img, index) => (
                      <div key={index} className="relative h-20 rounded-lg overflow-hidden">
                        <img 
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Product Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedProduct.name}</h3>
                    <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="text-lg font-semibold text-gray-800">{selectedProduct.category}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-500">Price</h4>
                      <p className="text-lg font-semibold text-gray-800">Rs.{selectedProduct.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-500">Stock</h4>
                      <p className="text-lg font-semibold text-gray-800">{selectedProduct.quantity} units</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className={`text-lg font-semibold ${
                        selectedProduct.quantity < 10 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedProduct.quantity < 10 ? 'Low Stock' : 'In Stock'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-150"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductManagement; 