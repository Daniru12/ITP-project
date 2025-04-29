import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

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
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      console.log('Fetching orders from:', `${backendUrl}/api/orders/provider/orders`);
      console.log('Token:', token); // For debugging

      const response = await axios.get(`${backendUrl}/api/orders/provider/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response data:', response.data); // For debugging

      if (response.data) {
        setOrders(response.data.orders || []);
        setStats(response.data.stats || {
          total: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          totalRevenue: 0
        });
      } else {
        console.log('No data in response');
        setError('No data received from server');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error details:', err.response || err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
  };

  console.log('Current state:', { orders, stats, loading, error }); // Debug current state

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Add a check for empty orders
  if (!orders || orders.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Order Management
        </Typography>
        <Alert severity="info">No orders found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#1a237e',
        fontWeight: 600,
        mb: 4 
      }}>
        Order Management
      </Typography>

      {/* Stats Cards with improved styling */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}>
            <ShoppingBag sx={{ color: '#1a237e', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.total}</Typography>
              <Typography color="textSecondary">Total Orders</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}>
            <Clock sx={{ color: '#f57c00', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.pending}</Typography>
              <Typography color="textSecondary">Pending Orders</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}>
            <Package sx={{ color: '#2e7d32', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.processing}</Typography>
              <Typography color="textSecondary">Processing</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderRadius: 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}>
            <TrendingUp sx={{ color: '#0288d1', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>Rs.{stats.totalRevenue.toFixed(2)}</Typography>
              <Typography color="textSecondary">Total Revenue</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Orders Table with improved styling */}
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Products</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order._id} 
                onClick={() => handleOrderClick(order)}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': { 
                    backgroundColor: '#f8f9fa'
                  }
                }}
              >
                <TableCell>{order._id}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.pet_owner?.username || 'N/A'}</TableCell>
                <TableCell>
                  {order.products
                    ?.map(item => `${item.product?.name || 'Unknown'} (${item.quantity})`)
                    .join(', ') || 'No products'}
                </TableCell>
                <TableCell>Rs.{order.total_price?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>
                  <Box sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: 
                      order.order_status === 'Pending' ? '#fff3e0' :
                      order.order_status === 'Processing' ? '#e3f2fd' :
                      order.order_status === 'Shipped' ? '#e8f5e9' :
                      order.order_status === 'Delivered' ? '#e8f5e9' : '#ffebee',
                    color:
                      order.order_status === 'Pending' ? '#f57c00' :
                      order.order_status === 'Processing' ? '#1976d2' :
                      order.order_status === 'Shipped' ? '#2e7d32' :
                      order.order_status === 'Delivered' ? '#2e7d32' : '#c62828',
                  }}>
                    {order.order_status || 'Unknown'}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog with improved styling */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Order #{selectedOrder._id}
              </Typography>
              <Typography gutterBottom>
                Status: {selectedOrder.order_status}
              </Typography>
              <Typography gutterBottom>
                Customer: {selectedOrder.pet_owner.username}
              </Typography>
              <Typography gutterBottom>
                Date: {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Products
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.products.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>Rs.{item.price.toFixed(2)}</TableCell>
                        <TableCell>Rs.{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>
                Shipping Details
              </Typography>
              <Typography>
                {selectedOrder.shipping_details.receiverName}
              </Typography>
              <Typography>
                {selectedOrder.shipping_details.phoneNumber}
              </Typography>
              <Typography>
                {selectedOrder.shipping_details.address}
              </Typography>
              <Typography>
                {selectedOrder.shipping_details.city}, {selectedOrder.shipping_details.postalCode}
              </Typography>
              <Typography>
                {selectedOrder.shipping_details.country}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProviderOrderManagement; 