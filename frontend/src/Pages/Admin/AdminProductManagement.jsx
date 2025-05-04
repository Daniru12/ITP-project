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
  Calendar,
  ArrowLeft,
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  BarChart2,
  Users,
  Percent
} from 'lucide-react';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
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
      categories: {},
      lowStock: 0
    };

    products.forEach(product => {
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
      <div className="min-h-screen bg-[var(--color-primary-light)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent-light)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="group flex items-center gap-2 px-4 py-2 bg-[var(--color-white)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] border border-[var(--color-primary-light)]"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-on-secondary)] mb-2">Product Management</h1>
                <p className="text-[var(--text-on-secondary)] opacity-70">Manage and monitor all products in your store</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-[var(--color-white)] rounded-xl shadow-sm border border-[var(--color-primary-light)]">
                <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Total Products</p>
                <p className="text-xl font-bold text-[var(--text-on-secondary)]">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Products Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-blue-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Total
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">{stats.totalProducts}</p>
              <p className="ml-2 text-sm text-blue-600 font-medium">Items</p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                <span>All active products</span>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Tag className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-purple-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Categories
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Categories</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">{Object.keys(stats.categories).length}</p>
              <p className="ml-2 text-sm text-purple-600 font-medium">Types</p>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="h-4 w-4 mr-1 text-purple-600" />
                <span>Product categories</span>
              </div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-yellow-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Alert
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Low Stock Items</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">{stats.lowStock}</p>
              <p className="ml-2 text-sm text-yellow-600 font-medium">Need Attention</p>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-100">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1 text-yellow-600" />
                <span>Requires restock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-on-secondary)] opacity-40" />
              <input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[var(--color-primary-light)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-200 text-[var(--text-on-secondary)]"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 border border-[var(--color-primary-light)] rounded-xl hover:bg-[var(--color-primary-light)] transition-all duration-200">
                <Filter className="h-5 w-5 text-[var(--text-on-secondary)]" />
              </button>
              <button className="p-3 border border-[var(--color-primary-light)] rounded-xl hover:bg-[var(--color-primary-light)] transition-all duration-200">
                <ArrowUpDown className="h-5 w-5 text-[var(--text-on-secondary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--color-primary-light)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-on-secondary)]">Product Inventory</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[var(--text-on-secondary)] opacity-70">Showing {filteredProducts.length} products</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-primary-light)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">
                    <div className="flex items-center space-x-1">
                      <span>Price</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">
                    <div className="flex items-center space-x-1">
                      <span>Stock</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-primary-light)]">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-[var(--color-primary-light)] transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img 
                            className="h-12 w-12 rounded-xl object-cover shadow-sm" 
                            src={product.image[0]} 
                            alt="" 
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-on-secondary)]">{product.name}</p>
                          <p className="text-sm text-[var(--text-on-secondary)] opacity-70">{product.description.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[var(--text-on-secondary)]">
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
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleViewDetails(product)}
                          className="text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] transition duration-150"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-[var(--text-on-secondary)] opacity-40 hover:opacity-100 transition duration-150">
                          <MoreVertical className="h-5 w-5" />
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
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-2xl transition-all sm:w-full sm:max-w-4xl">
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[var(--color-primary-light)] rounded-lg">
                        <Package className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <h2 className="text-2xl font-bold text-[var(--text-on-secondary)]">Product Details</h2>
                    </div>
                    <button 
                      onClick={closeModal}
                      className="p-2 hover:bg-[var(--color-primary-light)] rounded-lg transition-colors duration-200"
                    >
                      <X className="h-5 w-5 text-[var(--text-on-secondary)] opacity-40" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Product Images */}
                    <div className="space-y-4">
                      <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={selectedProduct.image[0]} 
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.image.map((img, index) => (
                          <div key={index} className="relative h-20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
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
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Tag className="h-4 w-4 text-blue-600" />
                            <h4 className="text-sm font-medium text-gray-600">Category</h4>
                          </div>
                          <p className="text-lg font-semibold text-gray-800">{selectedProduct.category}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <h4 className="text-sm font-medium text-gray-600">Price</h4>
                          </div>
                          <p className="text-lg font-semibold text-gray-800">Rs.{selectedProduct.price.toFixed(2)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <h4 className="text-sm font-medium text-gray-600">Stock</h4>
                          </div>
                          <p className="text-lg font-semibold text-gray-800">{selectedProduct.quantity} units</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <h4 className="text-sm font-medium text-gray-600">Status</h4>
                          </div>
                          <p className={`text-lg font-semibold ${
                            selectedProduct.quantity < 10 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {selectedProduct.quantity < 10 ? 'Low Stock' : 'In Stock'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                          onClick={closeModal}
                          className="px-6 py-3 text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Close</span>
                        </button>
                      </div>
                    </div>
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