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
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowLeft,
  Clock,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    categories: {},
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
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

  const handleDeleteClick = (product) => {
    setDeleteModal({
      isOpen: true,
      productId: product._id,
      productName: product.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.delete(`${backendUrl}/api/products/delete/${deleteModal.productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent-light)] p-8">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>

          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Modal panel */}
            <div 
              className="relative transform overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-2xl transition-all sm:w-full sm:max-w-lg"
              style={{
                animation: 'modal-pop 0.3s ease-out forwards'
              }}
            >
              {/* Modal content */}
              <div className="relative p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Warning Icon with pulse effect */}
                  <div className="relative mb-4">
                    <div className="absolute -inset-1 rounded-full bg-red-100 animate-pulse"></div>
                    <div className="relative h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertOctagon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-[var(--text-on-secondary)] mb-2">
                    Delete Product?
                  </h3>

                  {/* Description */}
                  <div className="mt-2 space-y-2 text-center">
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">
                      You are about to delete
                    </p>
                    <p className="text-lg font-medium text-[var(--text-on-secondary)] px-4 py-2 bg-[var(--color-primary-light)] rounded-lg inline-block">
                      {deleteModal.productName}
                    </p>
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">
                      This action cannot be undone and will permanently remove the product from your inventory.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0 space-y-3 space-y-reverse">
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="inline-flex justify-center items-center px-6 py-3 rounded-xl text-sm font-medium text-[var(--text-on-secondary)] bg-[var(--color-white)] border-2 border-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="inline-flex justify-center items-center px-6 py-3 rounded-xl text-sm font-medium text-[var(--text-on-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-accent)] border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modal-pop {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header Section with Icons */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/provider-profile')}
                className="group flex items-center gap-2 px-4 py-2 bg-[var(--color-white)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] border border-[var(--color-primary-light)]"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-on-secondary)] mb-2">Product Dashboard</h1>
                <p className="text-[var(--text-on-secondary)] opacity-70">Manage your product inventory and track performance</p>
              </div>
            </div>
            
            {/* Cart and Orders Icons */}
            <div className="flex items-center gap-6">
              <Link 
                to="/cart" 
                className="relative group"
              >
                <div className="p-3 bg-[var(--color-white)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--color-primary-light)] group-hover:border-[var(--color-primary)]">
                  <ShoppingCart className="w-7 h-7 text-[var(--text-on-secondary)] group-hover:text-[var(--color-primary)] transition-colors duration-300" />
                  <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-[var(--text-on-primary)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </div>
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-sm font-medium text-[var(--text-on-secondary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Cart
                </span>
              </Link>

              <Link 
                to="/orders" 
                className="relative group"
              >
                <div className="p-3 bg-[var(--color-white)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--color-primary-light)] group-hover:border-[var(--color-primary)]">
                  <ClipboardList className="w-7 h-7 text-[var(--text-on-secondary)] group-hover:text-[var(--color-primary)] transition-colors duration-300" />
                  <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-[var(--text-on-primary)] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </div>
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-sm font-medium text-[var(--text-on-secondary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Orders
                </span>
              </Link>

              <div className="px-4 py-2 bg-[var(--color-white)] rounded-xl shadow-sm border border-[var(--color-primary-light)]">
                <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Total Products</p>
                <p className="text-xl font-bold text-[var(--text-on-secondary)]">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Total Value Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-green-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Value
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Value</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">Rs.{stats.totalValue.toFixed(2)}</p>
              <p className="ml-2 text-sm text-green-600 font-medium">In Stock</p>
            </div>
            <div className="mt-4 pt-4 border-t border-green-100">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                <span>Total inventory value</span>
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

        {/* Products List Section */}
        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--color-primary-light)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-[var(--text-on-secondary)]">Product Inventory</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-on-secondary)] opacity-50" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-[var(--color-primary-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--text-on-secondary)]"
                  />
                </div>
                <button className="p-2 border border-[var(--color-primary-light)] rounded-lg hover:bg-[var(--color-primary-light)]">
                  <Filter className="h-5 w-5 text-[var(--text-on-secondary)]" />
                </button>
                <Link
                  to="/create-product"
                  className="inline-flex items-center px-4 py-2 bg-[var(--color-primary)] text-[var(--text-on-primary)] rounded-lg hover:bg-[var(--color-accent)] transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="font-medium">Create Product</span>
                </Link>
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
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-[var(--color-primary-light)] transition duration-150">
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
                        <Link 
                          to={`/product/${product._id}`}
                          className="text-blue-600 hover:text-blue-900 transition duration-150"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/update-product/${product._id}`}
                          className="text-yellow-600 hover:text-yellow-900 transition duration-150"
                          title="Edit Product"
                        >
                          <Edit2 className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 transition duration-150"
                          title="Delete Product"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition duration-150">
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
      </div>
    </div>
  );
};

export default ProductManagement; 