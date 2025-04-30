import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Package, TrendingUp, Clock, DollarSign, Truck, CheckCircle, Eye, AlertTriangle, FileDown, Printer, ArrowLeft } from 'lucide-react';

const ProviderOrderManagement = () => {
  const navigate = useNavigate();
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
          <title>Orders Report - ${new Date().toLocaleString()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Inter', sans-serif;
            }

            body {
              padding: 40px;
              color: #1f2937;
              background: #f9fafb;
            }

            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }

            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: #111827;
              margin-bottom: 8px;
            }

            .header p {
              color: #6b7280;
              font-size: 14px;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
              margin-bottom: 40px;
            }

            .stat-card {
              background: #f8fafc;
              padding: 24px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
            }

            .stat-card h3 {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 16px;
            }

            .stat-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .stat-item:last-child {
              border-bottom: none;
            }

            .stat-label {
              color: #6b7280;
              font-size: 14px;
            }

            .stat-value {
              font-weight: 600;
              color: #111827;
            }

            .orders-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 32px;
            }

            .orders-table th {
              background: #f3f4f6;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }

            .orders-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }

            .orders-table tr:last-child td {
              border-bottom: none;
            }

            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
            }

            .status-pending { background: #fef3c7; color: #92400e; }
            .status-processing { background: #dbeafe; color: #1e40af; }
            .status-shipped { background: #e0e7ff; color: #3730a3; }
            .status-delivered { background: #dcfce7; color: #166534; }

            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }

            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .report-container {
                box-shadow: none;
                padding: 20px;
              }

              .stat-card {
                break-inside: avoid;
              }

              .orders-table {
                break-inside: auto;
              }

              .orders-table tr {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
          <div class="header">
            <h1>Orders Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <h3>Order Statistics</h3>
                <div class="stat-item">
                  <span class="stat-label">Total Orders</span>
                  <span class="stat-value">${stats.total}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Pending Orders</span>
                  <span class="stat-value">${stats.pending}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Processing Orders</span>
                  <span class="stat-value">${stats.processing}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Shipped Orders</span>
                  <span class="stat-value">${stats.shipped}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Delivered Orders</span>
                  <span class="stat-value">${stats.delivered}</span>
                </div>
            </div>

            <div class="stat-card">
              <h3>Revenue Statistics</h3>
                <div class="stat-item">
                  <span class="stat-label">Total Revenue</span>
                  <span class="stat-value">Rs.${stats.totalRevenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average Order Value</span>
                  <span class="stat-value">Rs.${stats.total > 0 
                    ? (stats.totalRevenue / stats.total).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    : '0.00'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completed Orders Revenue</span>
                  <span class="stat-value">Rs.${(stats.totalRevenue * (stats.delivered / stats.total || 0)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completion Rate</span>
                  <span class="stat-value">${((stats.delivered / stats.total) * 100 || 0).toFixed(1)}%</span>
                </div>
            </div>
          </div>

            <table class="orders-table">
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
                    <td>
                      <span class="status-badge status-${order.order_status.toLowerCase()}">
                        ${order.order_status}
                      </span>
                    </td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

            <div class="footer">
              <p>This report was automatically generated by the Pet Store Management System</p>
              <p>© ${new Date().getFullYear()} Pet Store. All rights reserved.</p>
            </div>
          </div>
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
      <div className="min-h-screen bg-[var(--color-primary-light)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent-light)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/provider-profile')}
                className="group flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-gray-600 hover:text-gray-900 border border-gray-100"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-on-secondary)] mb-2">Order Management</h1>
                <p className="text-[var(--text-on-secondary)] opacity-70">Track and manage your customer orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Total Orders</p>
                <p className="text-xl font-bold text-[var(--text-on-secondary)]">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-blue-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Total
              </div>
            </div>
            <h3 className="text-[var(--text-on-secondary)] opacity-70 text-sm font-medium mb-1">Total Orders</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-[var(--text-on-secondary)]">{stats.total}</p>
              <p className="ml-2 text-sm text-blue-600 font-medium">Orders</p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="flex items-center text-sm text-[var(--text-on-secondary)] opacity-70">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                <span>All time orders</span>
              </div>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-yellow-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Pending
              </div>
            </div>
            <h3 className="text-[var(--text-on-secondary)] opacity-70 text-sm font-medium mb-1">Pending Orders</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-[var(--text-on-secondary)]">{stats.pending}</p>
              <p className="ml-2 text-sm text-yellow-600 font-medium">Need Action</p>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-100">
              <div className="flex items-center text-sm text-[var(--text-on-secondary)] opacity-70">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                <span>Requires attention</span>
              </div>
            </div>
          </div>

          {/* Processing Orders Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-purple-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Active
              </div>
            </div>
            <h3 className="text-[var(--text-on-secondary)] opacity-70 text-sm font-medium mb-1">Processing</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-[var(--text-on-secondary)]">{stats.processing}</p>
              <p className="ml-2 text-sm text-purple-600 font-medium">In Progress</p>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="flex items-center text-sm text-[var(--text-on-secondary)] opacity-70">
                <TrendingUp className="h-4 w-4 mr-1 text-purple-600" />
                <span>Currently processing</span>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-green-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Revenue
              </div>
            </div>
            <h3 className="text-[var(--text-on-secondary)] opacity-70 text-sm font-medium mb-1">Total Revenue</h3>
            <div className="flex flex-col">
              <p className="text-3xl font-bold text-[var(--text-on-secondary)]">
                Rs.{stats.totalRevenue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <div className="mt-4 pt-4 border-t border-green-100">
                <div className="flex items-center text-sm text-[var(--text-on-secondary)] opacity-70">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span>Total earnings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Generation Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-on-secondary)]">Generate Reports</h3>
              <p className="text-sm text-[var(--text-on-secondary)] opacity-70 mt-1">Export or print order statistics</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={generateCSV}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <FileDown className="h-5 w-5" />
                Export CSV
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                <Printer className="h-5 w-5" />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Orders List Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-[var(--text-on-secondary)]">Order List</h2>
                <p className="text-sm text-[var(--text-on-secondary)] opacity-70 mt-1">Manage and track all your orders</p>
            </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-600 font-medium">
                  Total: {orders.length}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-on-secondary)] uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-on-secondary)] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-on-secondary)] uppercase tracking-wider">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-on-secondary)] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-on-secondary)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-on-secondary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-on-secondary)]">{order._id.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--text-on-secondary)]">{order.pet_owner?.username || 'N/A'}</span>
                        <span className="text-xs text-[var(--text-on-secondary)] opacity-70">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {order.products?.map((item, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <span className="text-[var(--text-on-secondary)]">{item.product?.name || 'Unknown'}</span>
                            <span className="mx-2 text-[var(--text-on-secondary)] opacity-40">×</span>
                            <span className="text-[var(--text-on-secondary)] opacity-70">{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-[var(--text-on-secondary)]">
                        Rs.{order.total_price?.toFixed(2) || '0.00'}
                      </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 transition-all duration-200
                          ${order.order_status === 'Pending' 
                            ? 'bg-yellow-50 text-yellow-700 focus:ring-yellow-500' 
                            : order.order_status === 'Processing' 
                            ? 'bg-blue-50 text-blue-700 focus:ring-blue-500'
                            : order.order_status === 'Shipped' 
                            ? 'bg-purple-50 text-purple-700 focus:ring-purple-500'
                            : order.order_status === 'Delivered' 
                            ? 'bg-green-50 text-green-700 focus:ring-green-500'
                            : 'bg-red-50 text-red-700 focus:ring-red-500'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(order)}
                          className="p-2 text-[var(--text-on-secondary)] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                          className="p-2 text-[var(--text-on-secondary)] hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Mark as Delivered"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-on-secondary)] mb-1">No Orders Found</h3>
              <p className="text-sm text-[var(--text-on-secondary)] opacity-70">There are no orders to display at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
          {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-on-secondary)]">Order Details</h2>
                  <p className="text-sm text-[var(--text-on-secondary)] opacity-70 mt-1">Order ID: {selectedOrder._id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                  </div>
                </div>

            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="p-6 space-y-6">
                {/* Order Status Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text-on-secondary)]">Current Status</h3>
                      <p className="text-lg font-semibold text-[var(--text-on-secondary)] mt-1">{selectedOrder.order_status}</p>
                    </div>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 transition-all duration-200
                        ${selectedOrder.order_status === 'Pending' 
                          ? 'bg-yellow-50 text-yellow-700 focus:ring-yellow-500' 
                          : selectedOrder.order_status === 'Processing' 
                          ? 'bg-blue-50 text-blue-700 focus:ring-blue-500'
                          : selectedOrder.order_status === 'Shipped' 
                          ? 'bg-purple-50 text-purple-700 focus:ring-purple-500'
                          : selectedOrder.order_status === 'Delivered' 
                          ? 'bg-green-50 text-green-700 focus:ring-green-500'
                          : 'bg-red-50 text-red-700 focus:ring-red-500'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

                {/* Customer Information Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-on-secondary)]">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Customer Name</p>
                      <p className="text-base font-medium text-[var(--text-on-secondary)]">{selectedOrder.pet_owner?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Phone Number</p>
                      <p className="text-base font-medium text-[var(--text-on-secondary)]">{selectedOrder.shipping_details?.phoneNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-on-secondary)]">Shipping Address</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base text-[var(--text-on-secondary)]">{selectedOrder.shipping_details?.address}</p>
                    <p className="text-base text-[var(--text-on-secondary)]">
                      {selectedOrder.shipping_details?.city}, {selectedOrder.shipping_details?.postalCode}
                    </p>
                    <p className="text-base text-[var(--text-on-secondary)]">{selectedOrder.shipping_details?.country}</p>
                  </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-on-secondary)]">Order Items</h3>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.products.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                            <Package className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-on-secondary)]">{item.product.name}</p>
                            <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-on-secondary)]">
                          Rs.{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <p className="text-base font-medium text-[var(--text-on-secondary)]">Total Amount</p>
                      <p className="text-xl font-bold text-[var(--text-on-secondary)]">
                        Rs.{selectedOrder.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-on-secondary)]">Order Timeline</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-on-secondary)]">Order Placed</p>
                        <p className="text-xs text-[var(--text-on-secondary)] opacity-70">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedOrder.order_status !== 'Pending' && (
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-on-secondary)]">Order Confirmed</p>
                          <p className="text-xs text-[var(--text-on-secondary)] opacity-70">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-on-secondary)] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--text-on-secondary)] transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedOrder._id, 'Delivered')}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-on-secondary)] bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Mark as Delivered
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