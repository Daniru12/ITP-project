import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  MapPin, 
  Phone, 
  User, 
  Globe, 
  Mail,
  Building,
  Tag,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckSquare,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderConfirmPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    receiverName: '',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [acceptedCOD, setAcceptedCOD] = useState(false);

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
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      console.log('Validating promo code:', {
        code: promoCode,
        purchaseAmount: cart.items.reduce((total, item) => 
          total + (item.product.price * item.quantity), 0)
      });

      const response = await axios.post(
        `${backendUrl}/api/promocodes/validate`,
        {
          code: promoCode,
          purchaseAmount: cart.items.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Promo code validation response:', response.data);

      setAppliedPromoCode(response.data);
      toast.success('Promo code applied successfully!');
    } catch (error) {
      console.error('Promo code validation error:', error);
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setAppliedPromoCode(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const calculateFinalPrice = () => {
    const subtotal = cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
    
    if (appliedPromoCode) {
      const discount = (subtotal * appliedPromoCode.discount) / 100;
      return subtotal - discount;
    }
    return subtotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptedCOD) {
      toast.error('Please confirm the Cash on Delivery terms');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.post(
        `${backendUrl}/api/orders/create-from-cart`,
        { 
          shipping_details: shippingDetails,
          promo_code: appliedPromoCode ? appliedPromoCode.code : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-white)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Package className="w-16 h-16 text-[var(--color-primary)]" />
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
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
            <button 
              onClick={() => navigate('/cart')}
              className="absolute left-0 top-0 flex items-center text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              <span className="font-medium">Back to Cart</span>
            </button>
            <h1 className="text-3xl font-bold text-[var(--text-on-secondary)] text-center">
              Complete Your Order
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Details Form */}
            <div className="bg-[var(--color-white)] rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Truck className="w-6 h-6 text-[var(--color-primary)]" />
                <h2 className="text-xl font-semibold text-[var(--text-on-secondary)]">Shipping Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                      <User className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                      Receiver's Name
                    </label>
                    <input
                      type="text"
                      name="receiverName"
                      value={shippingDetails.receiverName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                      <Phone className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={shippingDetails.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                    <MapPin className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                      focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                      <Building className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingDetails.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                      <Mail className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingDetails.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                        focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm font-medium text-[var(--text-on-secondary)]">
                    <Globe className="w-4 h-4 mr-2 text-[var(--color-primary)]" />
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingDetails.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                      focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    placeholder="Enter country"
                  />
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <div className="bg-[var(--color-white)] rounded-2xl shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Package className="w-6 h-6 text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold text-[var(--text-on-secondary)]">Order Summary</h2>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.items.map((item) => (
                    <div 
                      key={item._id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[var(--color-primary-light)] transition-colors"
                    >
                      <img
                        src={item.product.image?.[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--text-on-secondary)]">{item.product.name}</h3>
                        <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[var(--color-primary)]">
                        Rs.{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="bg-[var(--color-white)] rounded-2xl shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-6 h-6 text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold text-[var(--text-on-secondary)]">Promo Code</h2>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-[var(--color-primary-light)] rounded-xl 
                      focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                  <button
                    onClick={validatePromoCode}
                    disabled={isValidatingPromo}
                    className="px-6 py-2 bg-[var(--color-primary)] text-[var(--text-on-primary)] rounded-xl
                      hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50 
                      disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>{isValidatingPromo ? 'Validating...' : 'Apply'}</span>
                    {!isValidatingPromo && <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>

                {appliedPromoCode && (
                  <div className="mt-3 p-3 bg-[var(--color-primary-light)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
                        <span className="text-[var(--color-primary)] font-medium">
                          {appliedPromoCode.discount}% discount applied
                        </span>
                      </div>
                      <button
                        onClick={() => setAppliedPromoCode(null)}
                        className="text-[var(--color-accent)] hover:text-[var(--color-primary)] text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Information */}
              <div className="bg-[var(--color-white)] rounded-2xl shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="w-6 h-6 text-[var(--color-primary)]" />
                  <h2 className="text-xl font-semibold text-[var(--text-on-secondary)]">Delivery Information</h2>
                </div>

                <div className="space-y-4">
                  {/* Delivery Features */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 p-3 bg-[var(--color-primary-light)] rounded-xl">
                      <Clock className="w-5 h-5 text-[var(--color-primary)] mt-1" />
                      <div>
                        <h3 className="font-medium text-[var(--text-on-secondary)]">Fast Delivery</h3>
                        <p className="text-sm text-[var(--text-on-secondary)] opacity-70">2-3 Business Days</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-[var(--color-primary-light)] rounded-xl">
                      <DollarSign className="w-5 h-5 text-[var(--color-primary)] mt-1" />
                      <div>
                        <h3 className="font-medium text-[var(--text-on-secondary)]">Cash on Delivery</h3>
                        <p className="text-sm text-[var(--text-on-secondary)] opacity-70">Pay when you receive</p>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center space-x-2 p-3 bg-[var(--color-primary-light)] rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">
                      Your order is protected by our secure delivery guarantee
                    </p>
                  </div>

                  {/* COD Confirmation Checkbox */}
                  <div className="mt-4">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={acceptedCOD}
                          onChange={(e) => setAcceptedCOD(e.target.checked)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 border-2 rounded transition-colors ${
                          acceptedCOD ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 
                          'border-[var(--color-primary-light)] group-hover:border-[var(--color-primary)]'
                        }`}>
                          {acceptedCOD && <CheckSquare className="w-4 h-4 text-[var(--text-on-primary)]" />}
                        </div>
                      </div>
                      <span className="text-sm text-[var(--text-on-secondary)] opacity-70">
                        I confirm that I will pay <span className="font-semibold">Rs.{calculateFinalPrice().toFixed(2)}</span> in 
                        cash upon delivery. I understand that the order cannot be cancelled once shipped.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Total Section */}
              <div className="bg-[var(--color-white)] rounded-2xl shadow-sm p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[var(--text-on-secondary)] opacity-70">
                    <span>Subtotal</span>
                    <span>Rs.{cart.items.reduce((total, item) => 
                      total + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  
                  {appliedPromoCode && (
                    <div className="flex justify-between text-[var(--color-primary)]">
                      <span>Discount ({appliedPromoCode.discount}%)</span>
                      <span>-Rs.{((cart.items.reduce((total, item) => 
                        total + (item.product.price * item.quantity), 0) * 
                        appliedPromoCode.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-[var(--color-primary-light)]">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-[var(--text-on-secondary)]">Total</span>
                      <span className="text-[var(--color-primary)]">Rs.{calculateFinalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !acceptedCOD}
                  className={`mt-6 w-full py-4 rounded-xl transition-colors
                    flex items-center justify-center space-x-2 shadow-sm
                    ${acceptedCOD 
                      ? 'bg-[var(--color-primary)] text-[var(--text-on-primary)] hover:bg-[var(--color-accent)]' 
                      : 'bg-[var(--color-primary-light)] text-[var(--text-on-secondary)] opacity-50 cursor-not-allowed'
                    }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {submitting ? 'Processing...' : 'Confirm Order (Cash on Delivery)'}
                  </span>
                </button>
                
                {!acceptedCOD && (
                  <p className="text-center text-sm text-[var(--text-on-secondary)] opacity-70 mt-2">
                    Please confirm the Cash on Delivery terms to proceed
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmPage; 