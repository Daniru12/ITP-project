import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2Icon, MinusIcon, PlusIcon } from 'lucide-react';

export const ShoppingCart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      toast.error('Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${backendUrl}/api/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
    } catch (error) {
      toast.error('Error updating quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${backendUrl}/api/cart/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Error removing item');
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/api/orders`,
        { cartItems: cart.items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Error placing order');
    }
  };

  if (loading) {
    return <div>Loading cart...</div>;
  }

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      
      {cart.items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.image[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-500">${item.product.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <MinusIcon size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <PlusIcon size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2Icon size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 