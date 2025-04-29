import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ShoppingCart, 
  Package, 
  CreditCard,
  Shield,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.get(
        `${backendUrl}/api/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) return; // Prevent quantity less than 1
      
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      await axios.put(
        `${backendUrl}/api/cart/update`,
        { 
          productId, 
          quantity: newQuantity 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchCart(); // Refresh cart after update
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update quantity');
      }
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      await axios.delete(
        `${backendUrl}/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Item removed from cart');
      fetchCart(); // Refresh cart after removal
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <ShoppingCart className="w-full h-full text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
              <span className="font-medium">Continue Shopping</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Your Cart
              </h1>
            </div>
          </div>

          {!cart || cart.items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-lg"
            >
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">Your cart is empty</p>
              <Link 
                to="/petMarketplace"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                  text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform 
                  hover:-translate-y-1 shadow-md hover:shadow-lg"
              >
                <Package className="w-5 h-5 mr-2" />
                Discover Products
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Cart Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-md"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-lg font-bold">{cart.items.length}</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-md"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-bold">
                        Rs.{cart.items.reduce((total, item) => 
                          total + (item.product.price * item.quantity), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="bg-white p-4 rounded-xl shadow-md"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Secure Checkout</p>
                      <p className="text-lg font-bold">Protected</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Cart Items */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 flex items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative group">
                          <img 
                            src={item.product.image?.[0] || 'placeholder-url'} 
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-xl shadow-md 
                              group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.product.quantity < 5 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white 
                              text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6 flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                          <div className="flex items-center mt-2 space-x-6">
                            <div className="flex items-center space-x-1">
                              <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 
                                  hover:text-gray-700 transition-colors"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </motion.button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 
                                  hover:text-gray-700 transition-colors"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <p className="text-lg font-semibold text-blue-600">
                              Rs.{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg 
                            hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Checkout Section */}
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-center text-lg font-semibold mb-4">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">
                      Rs.{cart.items.reduce((total, item) => 
                        total + (item.product.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <Link
                    to="/order-confirm"
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r 
                      from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl 
                      hover:from-blue-600 hover:to-blue-700 transition-all transform 
                      hover:-translate-y-1 shadow-md hover:shadow-lg"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage; 