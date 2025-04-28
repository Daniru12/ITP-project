import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, TrashIcon, MinusIcon, PlusIcon } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/petMarketplace" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Your cart is empty</p>
            <Link 
              to="/petMarketplace"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <div key={item._id} className="p-6 flex items-center">
                  <img 
                    src={item.product.image?.[0] || 'placeholder-url'} 
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-semibold">{item.product.name}</h3>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-800 font-medium">
                        Rs.{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>Rs.{cart.items.reduce((total, item) => 
                  total + (item.product.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              <Link
                to="/checkout"
                className="mt-4 w-full block text-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage; 