import React, { useState, useEffect } from "react";
import { CreditCardIcon, BanknoteIcon, ArrowLeftIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate, Link } from "react-router-dom";

const PaymentCreate = ({ onPaymentSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) {
        setError("Appointment ID is missing");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view appointment details");
          navigate("/login");
          return;
        }
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(
          `${backendUrl}/api/appointments/user/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data) throw new Error("No appointment data received");

        setAppointmentDetails(response.data);
        const selectedPackage = response.data.package_type;
        const packagePrices = response.data.service_id?.package_prices || {};
        const packagePrice = packagePrices[selectedPackage] || 0;
        setAmount(packagePrice.toString());
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Could not find appointment details";
        setError(errorMessage);
        toast.error(errorMessage);
        setAppointmentDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentDetails();
  }, [id, navigate]);

  const handlePaymentSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id || !appointmentDetails) throw new Error("Invalid or missing appointment details");
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to make a payment");

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const paymentData = {
        appointment_id: id,
        amount: parseFloat(amount),
        currency,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
        card_details:
          paymentMethod === "Card"
            ? {
                card_number: cardNumber.replace(/\s/g, ""),
                card_holder_name: cardHolderName,
                expiration_date: expiryDate,
                cvv,
              }
            : undefined,
      };

      const response = await axios.post(`${backendUrl}/api/payment/create`, paymentData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success("Payment successful!");
      if (onPaymentSuccess) onPaymentSuccess();
      navigate("/payments");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred during payment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#347486]"></div>
        <p className="mt-4 text-gray-600">Loading appointment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-[#BC4626] text-center mb-4">{error}</div>
        <Link to="/Appointment" className="bg-[#347486] hover:bg-[#2a5d6b] text-white px-4 py-2 rounded-md transition">
          Back to Appointments
        </Link>
      </div>
    );
  }

  if (!appointmentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-[#BC4626] text-center mb-4">No appointment details found</div>
        <Link to="/Appointment" className="bg-[#347486] hover:bg-[#2a5d6b] text-white px-4 py-2 rounded-md transition">
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: "url('/images/payment-bg.jpg')", // Replace with your image path
      }}
    >
      <div className="bg-white/90 backdrop-blur-md w-full max-w-6xl rounded-xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#347486]">Make Your Payment</h2>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side */}
            <div className="flex-1">
              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-3/4 p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-1/4 p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                  >
                    <option value="USD">USD</option>
                    <option value="LKR">LKR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8901"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                />
              </div>

              {/* Payment Method */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "Card" ? "border-[#347486] bg-[#347486]/10" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("Card")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "Card"}
                    onChange={() => setPaymentMethod("Card")}
                    className="h-5 w-5 text-[#347486] mr-2"
                  />
                  <CreditCardIcon className="h-6 w-6 text-[#BC4626] mr-3" />
                  <span className="font-medium text-base">Credit or Debit Card</span>
                </div>

                <div
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === "Cash" ? "border-[#347486] bg-[#347486]/10" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("Cash")}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className="h-5 w-5 text-[#347486] mr-2"
                  />
                  <BanknoteIcon className="h-6 w-6 text-[#BC4626] mr-3" />
                  <span className="font-medium text-base">Pay with Cash</span>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === "Card" && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Card Holder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Security Code</label>
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-[#347486] focus:border-[#347486]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePaymentSubmit}
                disabled={loading}
                className="w-full mt-6 bg-[#BC4626] text-white py-3 rounded-lg text-lg font-medium hover:bg-[#DFA55D] transition duration-300 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Make Payment"}
              </button>

              <Link
                to="/Appointment"
                className="block text-center mt-6 text-lg text-[#347486] hover:text-[#2a5d6b] font-medium flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Cancel and go back
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex-1 space-y-6">
              <div className="p-6 bg-[#347486]/5 rounded-lg border border-[#347486]/20">
                <h3 className="text-md font-semibold text-[#347486] mb-2">Appointment Details</h3>
                <p className="text-sm text-gray-600">Service: {appointmentDetails.service_id?.service_name}</p>
                <p className="text-sm text-gray-600">Package: {appointmentDetails.package_type}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(appointmentDetails.appointment_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Time: {new Date(appointmentDetails.appointment_date).toLocaleTimeString()}
                </p>
              </div>

              <div className="p-6 bg-[#DFA55D]/5 rounded-lg border border-[#DFA55D]/20">
                <h3 className="text-lg font-bold text-[#BC4626] mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Package Type</span>
                  <span className="text-gray-700">{appointmentDetails.package_type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Package Price</span>
                  <span className="text-gray-900 font-semibold">
                    {currency} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-[#DFA55D]/30 pt-4 mt-4 flex justify-between">
                  <span className="text-lg font-bold text-[#BC4626]">Total</span>
                  <span className="text-lg font-bold text-[#BC4626]">
                    {currency} {parseFloat(amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCreate;
