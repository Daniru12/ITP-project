import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  PackageIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  DollarSign,
  BarChart,
  ShoppingBag,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  User,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('');
  const [orderStats, setOrderStats] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'Processing':
        return <PackageIcon className="w-6 h-6 text-blue-500" />;
      case 'Shipped':
        return <TruckIcon className="w-6 h-6 text-purple-500" />;
      case 'Delivered':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'Cancelled':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const canUpdateStatus = () => {
    return userType === 'service_provider' || userType === 'admin';
  };

  const canCancelOrder = (order) => {
    return userType === 'pet_owner' && 
           order.order_status === 'Pending' &&
           new Date() - new Date(order.createdAt) < 24 * 60 * 60 * 1000;
  };

  const filterOrders = (status) => {
    setSelectedStatus(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.order_status === status));
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = userData.user_type;
    const currentPath = window.location.pathname;
    
    // Only redirect if on an incorrect path
    if (currentPath === '/orders') {
      // This is the product orders page - no redirect needed
      setUserType(userType);
      fetchOrders();
    } else if (userType === 'service_provider' && !currentPath.includes('/provider/orders')) {
      navigate('/provider/orders');
    } else if (userType === 'admin' && !currentPath.includes('/admin/orders')) {
      navigate('/admin/orders');
    } else {
      setUserType(userType);
      fetchOrders();
    }
  }, [navigate]);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userType = userData.user_type || '';
      setUserType(userType);
      
      let endpoint = '';
      // Updated endpoint selection
      if (window.location.pathname === '/orders') {
        // This is for the product orders page
        endpoint = `${backendUrl}/api/orders/user/product-orders`;
      } else if (window.location.pathname.includes('/provider/orders')) {
        endpoint = `${backendUrl}/api/orders/provider/orders`;
      } else if (window.location.pathname.includes('/admin/orders')) {
        endpoint = `${backendUrl}/api/orders/all`;
      }
      
      console.log('Using endpoint:', endpoint);
      console.log('User type:', userType);
      
      const response = await axios.get(
        endpoint,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Response:', response.data);
      
      if (response.data) {
        if (userType === 'service_provider') {
          setOrders(response.data.orders || []);
          setOrderStats(response.data.stats || null);
        } else {
          setOrders(Array.isArray(response.data) ? response.data : []);
        }
      }
    } catch (error) {
      console.error('Error details:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Failed to load orders';
      toast.error(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      await axios.post(
        `${backendUrl}/api/orders/${orderId}/cancel`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      toast.success('Order cancelled successfully');
      // Remove the cancelled order from the state
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      await axios.put(
        `${backendUrl}/api/orders/${orderId}/status`,
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      toast.success(`Order status updated to ${newStatus}`);
      // Update the order status in the state
      setOrders(orders.map(order => 
        order._id === orderId ? {...order, order_status: newStatus} : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getPageTitle = () => {
    const currentPath = window.location.pathname;
    if (currentPath === '/orders') {
      return 'My Product Orders';
    }
    switch(userType) {
      case 'service_provider':
        return 'Customer Orders';
      case 'admin':
        return 'All Orders';
      default:
        return 'Orders';
    }
  };

  const FilterSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6 bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Filter Orders</h2>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => filterOrders('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${selectedStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All Orders
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => filterOrders('Pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
            ${selectedStatus === 'Pending' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
        >
          <ClockIcon className="w-4 h-4" />
          <span>Pending</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => filterOrders('Processing')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
            ${selectedStatus === 'Processing' 
              ? 'bg-blue-500 text-white' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          <PackageIcon className="w-4 h-4" />
          <span>Processing</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => filterOrders('Shipped')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
            ${selectedStatus === 'Shipped' 
              ? 'bg-purple-500 text-white' 
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
        >
          <TruckIcon className="w-4 h-4" />
          <span>Shipped</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => filterOrders('Delivered')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
            ${selectedStatus === 'Delivered' 
              ? 'bg-green-500 text-white' 
              : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
        >
          <CheckCircleIcon className="w-4 h-4" />
          <span>Delivered</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => filterOrders('Cancelled')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
            ${selectedStatus === 'Cancelled' 
              ? 'bg-red-500 text-white' 
              : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
        >
          <XCircleIcon className="w-4 h-4" />
          <span>Cancelled</span>
        </motion.button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredOrders.length} {selectedStatus === 'all' ? 'total' : selectedStatus} orders
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingBag className="w-16 h-16 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <Link 
              to="/petMarketplace"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              <span className="font-medium">Back to Shop</span>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {getPageTitle()}
            </h1>
          </div>

          {userType === 'service_provider' && orderStats && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.total}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">{orderStats.pending}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <PackageIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Processing</p>
                    <p className="text-2xl font-bold text-blue-500">{orderStats.processing}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold text-green-500">
                      Rs.{orderStats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          <FilterSection />

          {filteredOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-lg"
            >
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                {orders.length === 0 
                  ? 'No orders found' 
                  : `No ${selectedStatus} orders found`}
              </p>
              {orders.length === 0 && (
                <Link 
                  to="/petMarketplace"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                    text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform 
                    hover:-translate-y-1 shadow-md hover:shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-500">
                            <BarChart className="w-4 h-4" />
                            <span className="text-sm">Order ID: {order._id}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              Placed on: {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {(userType === 'admin' || userType === 'service_provider') && order.pet_owner && (
                            <div className="flex items-center space-x-2 text-gray-500">
                              <User className="w-4 h-4" />
                              <span className="text-sm">
                                Customer: {order.pet_owner.username || order.pet_owner}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.order_status)}
                          <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {order.products.map((item) => (
                          <motion.div 
                            key={item._id} 
                            className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-blue-600">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center text-gray-900">
                              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                              Shipping Details
                            </h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                {order.shipping_details.receiverName}
                              </p>
                              <p className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {order.shipping_details.phoneNumber}
                              </p>
                              <p className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {order.shipping_details.address},
                                {order.shipping_details.city},
                                {order.shipping_details.postalCode},
                                {order.shipping_details.country}
                              </p>
                            </div>
                          </div>

                          <div className="text-right space-y-3">
                            <div className="text-sm text-gray-500">
                              <p>Subtotal: Rs.{(order.total_price + (order.discount_amount || 0)).toFixed(2)}</p>
                              
                              {order.promo_code_applied && order.discount_amount > 0 && (
                                <div className="text-green-600 mt-1">
                                  <p>Discount Applied</p>
                                  <p>- Rs.{order.discount_amount.toFixed(2)}
                                    <span className="text-xs ml-1">
                                      (Code: {order.promo_code_applied})
                                    </span>
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="font-medium text-gray-900">Total Amount</p>
                                <p className="text-xl font-bold text-blue-600">
                                  Rs.{order.total_price.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                              {canUpdateStatus() && (
                                <select 
                                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                                    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  value={order.order_status}
                                  onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              )}
                              
                              {canCancelOrder(order) && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-xl 
                                    hover:bg-red-600 transition-colors flex items-center space-x-2"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                  <span>Cancel Order</span>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrdersPage; 