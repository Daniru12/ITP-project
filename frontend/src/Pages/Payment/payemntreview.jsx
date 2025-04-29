import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PaymentReviewPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  // Fetch payments from backend
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
      console.error(err);
      setError('Failed to fetch payments');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Download financial report as PDF
  const downloadFinancialReport = () => {
    if (payments.length === 0) {
      alert('No payment data available to generate report.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Financial Report', 14, 22);

    const tableColumn = [
      "Appointment ID",
      "Amount",
      "Currency",
      "Payment Method",
      "Card Details",
      "Payment Date"
    ];

    const tableRows = payments.map((payment) => [
      payment.appointment_id ? payment.appointment_id._id : 'N/A',
      payment.amount,
      payment.currency,
      payment.payment_method,
      payment.payment_method === 'Card'
        ? `**** **** **** ${payment.card_details.card_number.slice(-4)}`
        : 'N/A',
      new Date(payment.createdAt).toLocaleString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] }, // Teal color header
    });

    const totalAmount = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const finalY = doc.lastAutoTable.finalY || 30;

    doc.setFontSize(12);
    doc.text(`Total Payments: ${payments.length}`, 14, finalY + 10);
    doc.text(`Total Amount: ${totalAmount}`, 14, finalY + 20);

    doc.save('Financial_Report.pdf');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Payment Review</h1>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

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
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No payments available
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {payment.appointment_id ? payment.appointment_id._id : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.amount}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.currency}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.payment_method}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {payment.payment_method === 'Card'
                      ? `**** **** **** ${payment.card_details.card_number.slice(-4)}`
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={downloadFinancialReport}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Download Financial Report
        </button>
      </div>
    </div>
  );
};

export default PaymentReviewPage;
