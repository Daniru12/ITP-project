import React, { useState, useEffect } from "react";
import { CreditCardIcon, BanknoteIcon } from "lucide-react";
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
        console.log("Fetching appointment:", id);
        const response = await axios.get(
          `${backendUrl}/api/appointments/user/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data) {
          throw new Error("No appointment data received");
        }

        console.log("Appointment data:", response.data);
        setAppointmentDetails(response.data);
        
        // Set the initial amount based on the service price
        const servicePrice = response.data.service_id?.price || 0;
        setAmount(servicePrice.toString());
        
        // Clear any previous errors
        setError(null);
      } catch (err) {
        console.error("Error fetching appointment:", err.response || err);
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
      // Validate appointment
      if (!id || !appointmentDetails) {
        throw new Error("Invalid or missing appointment details");
      }

      // Validate amount
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // // Validate card details if paying by card
      // if (paymentMethod === "Card") {
      //   if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      //     throw new Error("Please fill all card details");
      //   }
      //   if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      //     throw new Error("Invalid card number. Must be 16 digits");
      //   }
      //   if (!/^\d{3,4}$/.test(cvv)) {
      //     throw new Error("Invalid CVV. Must be 3 or 4 digits");
      //   }
      //   if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      //     throw new Error("Invalid expiry date format. Use MM/YY");
      //   }
      // }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login to make a payment");
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const paymentData = {
        appointment_id: id,
        amount: parseFloat(amount),
        currency,
        payment_method: paymentMethod,
        card_details: paymentMethod === "Card" ? {
          card_number: cardNumber.replace(/\s/g, ""),
          card_holder_name: cardHolderName,
          expiration_date: expiryDate,
          cvv,
        } : undefined
      };

      console.log("Sending payment data:", paymentData); // Debug log

      const response = await axios.post(
        `${backendUrl}/api/payment/create`,
        paymentData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("Payment response:", response.data); // Debug log

      toast.success("Payment successful!");
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      navigate("/payments");
    } catch (err) {
      console.error("Payment error:", err.response?.data || err); // Debug log
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading appointment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <Link
          to="/Appointment"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
        >
          Back to Appointments
        </Link>
      </div>
    );
  }

  if (!appointmentDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 text-center mb-4">No appointment details found</div>
        <Link
          to="/Appointment"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
        >
          Back to Appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full sm:w-[400px] mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Make a Payment</h2>

      {/* Appointment Details */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h3>
        <p className="text-sm text-gray-600">Service: {appointmentDetails.service_id?.service_name}</p>
        <p className="text-sm text-gray-600">Package: {appointmentDetails.package_type}</p>
        <p className="text-sm text-gray-600">
          Date: {new Date(appointmentDetails.appointment_date).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">
          Time: {new Date(appointmentDetails.appointment_date).toLocaleTimeString()}
        </p>
      </div>

      {/* Amount and Currency Fields */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-3/4 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-1/4 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="USD">USD</option>
            <option value="LKR">LKR</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Payment Method Selection */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h2>
      <div className="space-y-2 mb-4">
        {/* Credit Card Option */}
        <div
          className={`flex items-center p-2 border rounded-md cursor-pointer ${
            paymentMethod === "Card" ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          onClick={() => setPaymentMethod("Card")}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "Card"}
            onChange={() => setPaymentMethod("Card")}
            className="h-5 w-5 text-blue-600 mr-2"
          />
          <CreditCardIcon className="h-5 w-5 text-gray-700 mr-2" />
          <span className="font-medium text-sm">Credit or Debit Card</span>
        </div>

        {/* Cash Option */}
        <div
          className={`flex items-center p-2 border rounded-md cursor-pointer ${
            paymentMethod === "Cash" ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          onClick={() => setPaymentMethod("Cash")}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "Cash"}
            onChange={() => setPaymentMethod("Cash")}
            className="h-5 w-5 text-blue-600 mr-2"
          />
          <BanknoteIcon className="h-5 w-5 text-gray-700 mr-2" />
          <span className="font-medium text-sm">Pay with Cash</span>
        </div>
      </div>

      {/* Card Details */}
      {paymentMethod === "Card" && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Card Holder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Security Code</label>
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePaymentSubmit}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Make Payment"}
      </button>

      {/* Back to Appointments Link */}
      <Link
        to="/Appointment"
        className="block text-center mt-4 text-sm text-gray-600 hover:text-gray-800"
      >
        Cancel and go back
      </Link>
    </div>
  );
};

export default PaymentCreate;
