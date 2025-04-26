import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit, Trash } from 'lucide-react';

const PaymentReviewPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/payment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to fetch payments');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/payment/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove deleted payment from UI
      setPayments((prevPayments) => prevPayments.filter((payment) => payment._id !== id));
    } catch (err) {
      console.error('Failed to delete payment', err);
      setError('Failed to delete payment');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Payment Review</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Appointment ID</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Currency</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Payment Method</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Card Details</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Payment Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">No payments available</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.appointment_id ? payment.appointment_id._id : 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.amount}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.currency}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.payment_method}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {payment.payment_method === 'Card'
                      ? `**** **** **** ${payment.card_details.card_number.slice(-4)}`
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{new Date(payment.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 flex space-x-4">
                    
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(payment._id)}
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentReviewPage;
