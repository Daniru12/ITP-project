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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingBag className="w-16 h-16 text-[var(--color-primary)]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-white)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-8">
            <Link 
              to="/petMarketplace"
              className="absolute left-0 top-1 flex items-center text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              <span className="font-medium">Back to Shop</span>
            </Link>
            <div className="flex justify-center">
              <h1 className="text-3xl font-bold text-[var(--text-on-secondary)]">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {userType === 'service_provider' && orderStats && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[var(--color-white)] p-6 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-8 h-8 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Total Orders</p>
                    <p className="text-2xl font-bold text-[var(--text-on-secondary)]">{orderStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-white)] p-6 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">{orderStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-white)] p-6 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <PackageIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Processing</p>
                    <p className="text-2xl font-bold text-blue-500">{orderStats.processing}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-white)] p-6 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Revenue</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                      Rs.{orderStats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 bg-[var(--color-white)] rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-on-secondary)]">Filter Orders</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => filterOrders('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${selectedStatus === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All Orders
              </button>
              
              <button
                onClick={() => filterOrders('Pending')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
                  ${selectedStatus === 'Pending' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
              >
                <ClockIcon className="w-4 h-4" />
                <span>Pending</span>
              </button>
              
              <button
                onClick={() => filterOrders('Processing')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
                  ${selectedStatus === 'Processing' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                <PackageIcon className="w-4 h-4" />
                <span>Processing</span>
              </button>
              
              <button
                onClick={() => filterOrders('Shipped')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
                  ${selectedStatus === 'Shipped' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
              >
                <TruckIcon className="w-4 h-4" />
                <span>Shipped</span>
              </button>
              
              <button
                onClick={() => filterOrders('Delivered')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
                  ${selectedStatus === 'Delivered' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Delivered</span>
              </button>
              
              <button
                onClick={() => filterOrders('Cancelled')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2
                  ${selectedStatus === 'Cancelled' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
              >
                <XCircleIcon className="w-4 h-4" />
                <span>Cancelled</span>
              </button>
            </div>

            <div className="mt-4 text-sm text-[var(--text-on-secondary)] opacity-70">
              Showing {filteredOrders.length} {selectedStatus === 'all' ? 'total' : selectedStatus} orders
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-white)] rounded-2xl shadow-sm">
              <ShoppingBag className="w-16 h-16 text-[var(--text-on-secondary)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--text-on-secondary)] opacity-70 mb-6">
                {orders.length === 0 
                  ? 'No orders found' 
                  : `No ${selectedStatus} orders found`}
              </p>
              {orders.length === 0 && (
                <Link 
                  to="/petMarketplace"
                  className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] 
                    text-[var(--text-on-primary)] rounded-xl hover:bg-[var(--color-accent)] 
                    transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-[var(--color-white)] rounded-2xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-[var(--text-on-secondary)] opacity-70">
                            <BarChart className="w-4 h-4" />
                            <span className="text-sm">Order ID: {order._id}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[var(--text-on-secondary)] opacity-70">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              Placed on: {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {(userType === 'admin' || userType === 'service_provider') && order.pet_owner && (
                            <div className="flex items-center space-x-2 text-[var(--text-on-secondary)] opacity-70">
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
                          <div 
                            key={item._id} 
                            className="flex items-center p-4 rounded-xl hover:bg-[var(--color-primary-light)] transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium text-[var(--text-on-secondary)]">{item.product.name}</h3>
                              <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-[var(--color-primary)]">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-6 border-t border-[var(--color-primary-light)]">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center text-[var(--text-on-secondary)]">
                              <MapPin className="w-4 h-4 mr-2 text-[var(--text-on-secondary)] opacity-70" />
                              Shipping Details
                            </h4>
                            <div className="text-sm text-[var(--text-on-secondary)] opacity-70 space-y-1">
                              <p className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                {order.shipping_details.receiverName}
                              </p>
                              <p className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {order.shipping_details.phoneNumber}
                              </p>
                              <p className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {order.shipping_details.address},
                                {order.shipping_details.city},
                                {order.shipping_details.postalCode},
                                {order.shipping_details.country}
                              </p>
                            </div>
                          </div>

                          <div className="text-right space-y-3">
                            <div className="text-sm text-[var(--text-on-secondary)] opacity-70">
                              <p>Subtotal: Rs.{(order.total_price + (order.discount_amount || 0)).toFixed(2)}</p>
                              
                              {order.promo_code_applied && order.discount_amount > 0 && (
                                <div className="text-[var(--color-primary)] mt-1">
                                  <p>Discount Applied</p>
                                  <p>- Rs.{order.discount_amount.toFixed(2)}
                                    <span className="text-xs ml-1">
                                      (Code: {order.promo_code_applied})
                                    </span>
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-2 pt-2 border-t border-[var(--color-primary-light)]">
                                <p className="font-medium text-[var(--text-on-secondary)]">Total Amount</p>
                                <p className="text-xl font-bold text-[var(--color-primary)]">
                                  Rs.{order.total_price.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                              {canUpdateStatus() && (
                                <select 
                                  className="px-4 py-2 border border-[var(--color-primary-light)] rounded-xl text-sm
                                    focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
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
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-xl 
                                    hover:bg-red-600 transition-colors flex items-center space-x-2"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                  <span>Cancel Order</span>
                                </button>
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