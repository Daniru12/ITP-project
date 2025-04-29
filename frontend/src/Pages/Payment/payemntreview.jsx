import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText } from 'lucide-react';

const PaymentReviewPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      let response;
      let endpoint;

      try {
        endpoint = '/api/payment';
        response = await axios.get(`${backendUrl}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err1) {
        if (err1.response?.status === 404) {
          try {
            endpoint = '/payment';
            response = await axios.get(`${backendUrl}${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err2) {
            if (err2.response?.status === 404) {
              endpoint = '/api/payments';
              response = await axios.get(`${backendUrl}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err1;
        }
      }

      const data = response.data;
      const paymentsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.payments)
        ? data.payments
        : Array.isArray(data.data)
        ? data.data
        : [];

      setPayments(paymentsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      if (err.response?.status === 404) {
        setError('API endpoint not found.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.message || 'Failed to fetch payments.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const generatePDFReceipt = (payment) => {
    const doc = new jsPDF();

    doc.setFillColor(52, 152, 219);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Payment Receipt', 105, 20, null, null, 'center');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const paymentId = payment._id?.slice(-6) || 'N/A';
    const date = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A';
    const appointmentId = payment.appointment_id?._id?.slice(-6) || 'N/A';
    const amount = isNaN(payment.amount) ? '0.00' : `$${payment.amount.toFixed(2)}`;
    const method = payment.payment_method || 'N/A';
    const card = method === 'Card' && payment.card_details?.card_number
      ? '**** ' + payment.card_details.card_number.slice(-4)
      : 'N/A';

    const lines = [
      `Receipt ID: ${paymentId}`,
      `Date: ${date}`,
      `Appointment ID: ${appointmentId}`,
      `Amount: ${amount}`,
      `Payment Method: ${method}`,
      `Card Details: ${card}`
    ];

    lines.forEach((line, i) => {
      doc.text(line, 20, 50 + i * 10);
    });

    doc.save(`payment_receipt_${paymentId}.pdf`);
  };

  const generateFullPaymentsPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(40, 167, 69);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Payments Report', 105, 20, null, null, 'center');

    const today = new Date().toLocaleDateString();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated: ${today}`, 160, 40);

    const tableData = payments.map(p => [
      p._id?.slice(-6) || 'N/A',
      p.appointment_id?._id?.slice(-6) || 'N/A',
      `$${(p.amount || 0).toFixed(2)}`,
      p.payment_method || 'N/A',
      p.payment_method === 'Card' && p.card_details?.card_number
        ? '**** ' + p.card_details.card_number.slice(-4)
        : 'N/A',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A',
      p.status || 'Completed'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['ID', 'Appointment ID', 'Amount', 'Method', 'Card Details', 'Date', 'Status']],
      body: tableData,
      theme: 'striped'
    });

    doc.save(`payments_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Payment Records</h1>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-400 border-t-transparent"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          <div className="overflow-x-auto shadow rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Appointment', 'Amount', 'Method', 'Card', 'Date', 'Actions'].map(header => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-sm text-gray-500 py-4">
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{p._id?.slice(-6)}</td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {p.appointment_id?._id?.slice(-6) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">${(p.amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm capitalize">{p.payment_method || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {p.payment_method === 'Card' && p.card_details?.card_number
                          ? '•••• ' + p.card_details.card_number.slice(-4)
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => generatePDFReceipt(p)}
                          className="inline-flex items-center px-3 py-1 text-white font-medium rounded-md bg-blue-500 hover:bg-blue-600 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center">
            <button
              onClick={generateFullPaymentsPDF}
              disabled={payments.length === 0}
              className={`inline-flex items-center px-5 py-3 text-white font-semibold rounded-md shadow ${
                payments.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              Export PDF Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentReviewPage;
