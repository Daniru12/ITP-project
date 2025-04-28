import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, PackageIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.get(
        `${backendUrl}/api/orders/my-orders`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data) {
        console.log('Orders received:', response.data);
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
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
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
    }
  };

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

  const canCancelOrder = (order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDifference = (now - orderDate) / (1000 * 60 * 60);
    
    // Only allow cancellation within 24 hours
    return hoursDifference <= 24;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/petMarketplace"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No orders found</p>
            <Link 
              to="/petMarketplace"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID: {order._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.order_status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {order.products.map((item) => (
                      <div key={item._id} className="py-4 flex justify-between">
                        <div>
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rs.{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Shipping Details:</h4>
                        <p className="text-sm text-gray-600">
                          Receiver: {order.shipping_details.receiverName}<br />
                          Phone: {order.shipping_details.phoneNumber}<br />
                          Address: {order.shipping_details.address},<br />
                          {order.shipping_details.city},<br />
                          {order.shipping_details.postalCode},<br />
                          {order.shipping_details.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-lg font-bold">
                          Rs.{order.total_price.toFixed(2)}
                        </p>
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md 
                              hover:bg-red-700 text-sm"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 