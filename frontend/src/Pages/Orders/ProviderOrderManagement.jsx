import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, TrendingUp, Clock, DollarSign, Truck, CheckCircle, Eye, AlertTriangle, FileDown, Printer } from 'lucide-react';

const ProviderOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view orders');
        return;
      }

      const response = await axios.get(
        `${backendUrl}/api/orders/provider/orders`,
        { 
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Raw response data:', response.data);
      console.log('Orders:', response.data.orders);
      console.log('Stats:', response.data.stats);

      if (response.data) {
        const totalRevenue = response.data.orders?.reduce((sum, order) => {
          return sum + (order.products?.reduce((productSum, product) => {
            return productSum + (product.price * product.quantity);
          }, 0) || 0);
        }, 0) || 0;

        const pendingOrders = response.data.orders?.filter(order => order.order_status === 'Pending').length || 0;
        const processingOrders = response.data.orders?.filter(order => order.order_status === 'Processing').length || 0;
        const shippedOrders = response.data.orders?.filter(order => order.order_status === 'Shipped').length || 0;
        const deliveredOrders = response.data.orders?.filter(order => order.order_status === 'Delivered').length || 0;

        setOrders(response.data.orders || []);
        setStats({
          total: response.data.orders?.length || 0,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          totalRevenue: totalRevenue
        });

        console.log('Calculated stats:', {
          total: response.data.orders?.length || 0,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          totalRevenue: totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('token');
      
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
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const generateCSV = () => {
    // Create CSV content
    const headers = ['Order ID', 'Customer', 'Products', 'Total Price', 'Status', 'Date'];
    const csvData = orders.map(order => [
      order._id,
      order.pet_owner?.username || 'N/A',
      order.products?.map(item => `${item.product?.name}(${item.quantity})`).join('; '),
      `Rs.${order.total_price?.toFixed(2)}`,
      order.order_status,
      new Date(order.createdAt).toLocaleDateString()
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-report-${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orders Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .header { margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { background-color: #f8f8f8; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Orders Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <h3>Order Statistics</h3>
              <p>Total Orders: ${stats.total}</p>
              <p>Pending Orders: ${stats.pending}</p>
              <p>Processing Orders: ${stats.processing}</p>
              <p>Shipped Orders: ${stats.shipped}</p>
              <p>Delivered Orders: ${stats.delivered}</p>
            </div>
            <div class="stat-card">
              <h3>Revenue Statistics</h3>
              <p>Total Revenue: Rs.${stats.totalRevenue.toFixed(2)}</p>
              <p>Average Order Value: Rs.${stats.total > 0 ? (stats.totalRevenue / stats.total).toFixed(2) : '0.00'}</p>
              <p>Completed Orders Revenue: Rs.${(stats.totalRevenue * (stats.delivered / stats.total || 0)).toFixed(2)}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order._id}</td>
                  <td>${order.pet_owner?.username || 'N/A'}</td>
                  <td>${order.products?.map(item => 
                    `${item.product?.name}(${item.quantity})`).join('; ')}</td>
                  <td>Rs.${order.total_price?.toFixed(2)}</td>
                  <td>${order.order_status}</td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600">Track and manage your customer orders</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="ml-2 text-sm text-green-500">Orders</p>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <TrendingUp className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
              <p className="ml-2 text-sm text-yellow-500">Need Action</p>
            </div>
          </div>

          {/* Processing Orders Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-purple-500 text-sm font-medium">Active</div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Processing</h3>
            <div className="flex items-baseline mt-2">
              <p className="text-3xl font-bold text-gray-800">{stats.processing}</p>
              <p className="ml-2 text-sm text-purple-500">In Progress</p>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <div className="flex flex-col mt-2">
              <p className="text-3xl font-bold text-gray-800">
                Rs.{stats.totalRevenue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <div className="flex items-center mt-1">
                <p className="text-sm text-green-500">From Your Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Generate Reports</h3>
              <p className="text-sm text-gray-500">Export or print order statistics</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={generateCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FileDown className="h-5 w-5" />
                Export CSV
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Printer className="h-5 w-5" />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Revenue Summary</h3>
              <p className="text-sm text-gray-500">Detailed breakdown of your earnings</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Orders Processed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="text-xl font-semibold text-gray-800">
                Rs.{stats.total > 0 
                  ? (stats.totalRevenue / stats.total).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : '0.00'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed Orders Revenue</p>
              <p className="text-xl font-semibold text-green-600">
                Rs.{(stats.totalRevenue * (stats.delivered / stats.total || 0)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
            <div className="space-y-4">
              {[
                { status: 'Pending', count: stats.pending, color: 'bg-yellow-100' },
                { status: 'Processing', count: stats.processing, color: 'bg-blue-100' },
                { status: 'Shipped', count: stats.shipped, color: 'bg-purple-100' },
                { status: 'Delivered', count: stats.delivered, color: 'bg-green-100' }
              ].map(({ status, count, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
                    <span className="text-sm text-gray-600">{status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-800">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({((count / stats.total) * 100 || 0).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Order List</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Products</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 text-sm text-gray-900">{order._id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{order.pet_owner?.username || 'N/A'}</p>
                        <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.products?.map(item => 
                          `${item.product?.name || 'Unknown'} (${item.quantity})`
                        ).join(', ') || 'No products'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        Rs.{order.total_price?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold border-0
                          ${order.order_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.order_status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.order_status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                            order.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-900 transition duration-150"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
          {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>{selectedOrder.pet_owner?.username}</p>
                  <p>{selectedOrder.shipping_details?.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Shipping Address</h3>
                  <p>{selectedOrder.shipping_details?.address}</p>
                  <p>{selectedOrder.shipping_details?.city}, {selectedOrder.shipping_details?.postalCode}</p>
                  <p>{selectedOrder.shipping_details?.country}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Products</h3>
                  <div className="mt-2">
                    {selectedOrder.products.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-right">
                    <p className="font-bold">Total: Rs.{selectedOrder.total_price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Order Status</h3>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border
                      ${selectedOrder.order_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.order_status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.order_status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        selectedOrder.order_status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-150"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderOrderManagement; 