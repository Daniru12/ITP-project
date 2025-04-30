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
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <ShoppingCart className="w-full h-full text-[var(--color-primary)]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-white)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-8">
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <Link 
                to="/petMarketplace" 
                className="flex items-center text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Continue Shopping</span>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <ShoppingCart className="w-8 h-8 text-[var(--color-primary)]" />
              <h1 className="text-3xl font-bold text-[var(--text-on-secondary)]">
                Your Cart
              </h1>
            </div>
          </div>

          {!cart || cart.items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-[var(--color-white)] rounded-2xl shadow-md"
            >
              <ShoppingCart className="w-16 h-16 text-[var(--text-on-secondary)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--text-on-secondary)] opacity-70 mb-6">Your cart is empty</p>
              <Link 
                to="/petMarketplace"
                className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] 
                  text-[var(--text-on-primary)] rounded-xl hover:bg-[var(--color-accent)] 
                  transition-colors shadow-sm"
              >
                <Package className="w-5 h-5 mr-2" />
                Discover Products
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[var(--color-white)] p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Total Items</p>
                      <p className="text-lg font-bold text-[var(--text-on-secondary)]">{cart.items.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--color-white)] p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Total Amount</p>
                      <p className="text-lg font-bold text-[var(--text-on-secondary)]">
                        Rs.{cart.items.reduce((total, item) => 
                          total + (item.product.price * item.quantity), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--color-white)] p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Secure Checkout</p>
                      <p className="text-lg font-bold text-[var(--text-on-secondary)]">Protected</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--color-white)] rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-[var(--color-primary-light)]">
                  <AnimatePresence>
                    {cart.items.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 flex items-center hover:bg-[var(--color-primary-light)] transition-colors"
                      >
                        <div className="relative">
                          <img 
                            src={item.product.image?.[0] || 'placeholder-url'} 
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-xl shadow-sm"
                          />
                          {item.product.quantity < 5 && (
                            <div className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-[var(--text-on-accent)] 
                              text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-6 flex-1">
                          <h3 className="text-lg font-semibold text-[var(--text-on-secondary)]">{item.product.name}</h3>
                          <div className="flex items-center mt-2 space-x-6">
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                className="p-1.5 rounded-lg hover:bg-[var(--color-primary-light)] text-[var(--text-on-secondary)] 
                                  hover:text-[var(--color-primary)] transition-colors"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-[var(--text-on-secondary)]">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                className="p-1.5 rounded-lg hover:bg-[var(--color-primary-light)] text-[var(--text-on-secondary)] 
                                  hover:text-[var(--color-primary)] transition-colors"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-lg font-semibold text-[var(--color-primary)]">
                              Rs.{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-[var(--color-accent)] hover:text-[var(--color-primary)] p-2 rounded-lg 
                            hover:bg-[var(--color-primary-light)] transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-6 bg-[var(--color-white)]">
                  <div className="flex justify-between items-center text-lg font-semibold mb-4">
                    <span className="text-[var(--text-on-secondary)]">Total Amount:</span>
                    <span className="text-[var(--color-primary)]">
                      Rs.{cart.items.reduce((total, item) => 
                        total + (item.product.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <Link
                    to="/order-confirm"
                    className="w-full flex items-center justify-center space-x-2 bg-[var(--color-primary)] 
                      text-[var(--text-on-primary)] px-6 py-3 rounded-xl hover:bg-[var(--color-accent)] 
                      transition-colors shadow-sm"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage; 