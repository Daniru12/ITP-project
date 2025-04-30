import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentReviewPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token missing');

        const endpoints = ['/api/payment', '/payment', '/api/payments'];
        let response;

        for (const endpoint of endpoints) {
          try {
            response = await axios.get(`${backendUrl}${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) break;
          } catch (err) {
            if (err.response?.status !== 404) throw err;
          }
        }

        const data = response?.data;
        const paymentsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.payments)
          ? data.payments
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setPayments(paymentsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching payments:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(err.message || 'Failed to fetch payments.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Calculate statistics
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const cardPayments = payments.filter(p => p.payment_method === 'Card').length;
  const cashPayments = payments.filter(p => p.payment_method?.toLowerCase().includes('cash')).length;
  const cardPercentage = payments.length > 0 ? (cardPayments / payments.length * 100).toFixed(1) : 0;
  const cashPercentage = payments.length > 0 ? (cashPayments / payments.length * 100).toFixed(1) : 0;

  const generatePDFReceipt = (payment) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = 'https://i.postimg.cc/6qNSPZcz/4d03dcbf-fba9-43c7-a30d-18a0f1bc8cd2.png';

    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 30, 30);
      doc.setFillColor(52, 116, 134);  // #347486 - Teal Blue
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Payment Receipt', 105, 20, null, null, 'center');

      doc.setTextColor(0);
      doc.setFontSize(12);

      const receiptId = payment._id?.slice(-6) || 'N/A';
      const date = payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A';
      const appointmentId = payment.appointment_id?._id?.slice(-6) || 'N/A';
      const packageType = payment.package_type || payment.appointment_id?.package_type || 'N/A';
      const amount = isNaN(payment.amount) ? '0.00' : `$${payment.amount.toFixed(2)}`;
      const method = payment.payment_method || 'N/A';
      const card =
        method === 'Card' && payment.card_details?.card_number
          ? '**** ' + payment.card_details.card_number.slice(-4)
          : '—';

      let y = 50;

      const section = (label, value) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(`${value}`, 70, y);
        y += 10;
      };

      section('Receipt ID', receiptId);
      section('Date', date);
      section('Appointment ID', appointmentId);
      section('Package Type', packageType);
      section('Payment Method', method);
      if (method === 'Card') section('Card Details', card);
      section('Amount Paid', amount);

      y += 10;
      doc.setDrawColor(188, 70, 38);  // #BC4626 - Terracotta Red
      doc.line(20, y, 190, y);
      y += 10;

      doc.setFontSize(10);
      doc.text('Thank you for your payment!', 105, y, null, null, 'center');

      doc.save(`payment_receipt_${receiptId}.pdf`);
    };
  };

  const generateFullPaymentsPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(188, 70, 38);  // #BC4626 - Terracotta Red
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Payments Report', 105, 20, null, null, 'center');

    const today = new Date().toLocaleDateString();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated: ${today}`, 160, 40);

    const totalCard = payments.filter(p => p.payment_method === 'Card').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCash = payments.filter(p => p.payment_method?.toLowerCase().includes('cash')).reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOther = payments.filter(p => p.payment_method !== 'Card' && !p.payment_method?.toLowerCase().includes('cash')).reduce((sum, p) => sum + (p.amount || 0), 0);
    const overallTotal = totalCard + totalCash + totalOther;

    const summary = [
      `Total Card Payments: $${totalCard.toFixed(2)}`,
      `Total Cash Payments: $${totalCash.toFixed(2)}`,
      `Total Other Payments: $${totalOther.toFixed(2)}`,
      `-------------------------------------`,
      `Overall Total: $${overallTotal.toFixed(2)}`
    ];

    doc.setFontSize(12);
    summary.forEach((line, i) => {
      doc.text(line, 20, 50 + i * 8);
    });

    const tableStartY = 50 + summary.length * 8 + 10;

    const tableData = payments.map(p => [
      p._id?.slice(-6) || 'N/A',
      p.appointment_id?._id?.slice(-6) || 'N/A',
      p.package_type || p.appointment_id?.package_type || '—',
      `$${(p.amount || 0).toFixed(2)}`,
      p.payment_method || 'N/A',
      p.payment_method === 'Card' && p.card_details?.card_number
        ? '**** ' + p.card_details.card_number.slice(-4)
        : '—',
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A',
      p.status || 'Completed',
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['ID', 'Appointment', 'Package', 'Amount', 'Method', 'Card', 'Date', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [223, 165, 93] },  // #DFA55D - Sandy Gold
    });

    doc.save(`payments_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-[#BC4626]">Payment Records</h1>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#DFA55D] border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-[#BC4626] p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#BC4626]">
              <h2 className="text-xl font-semibold mb-2 text-[#347486]">Total Revenue</h2>
              <p className="text-2xl font-bold text-[#BC4626]">${totalRevenue.toFixed(2)}</p>
              <p className="text-gray-600">{payments.length} total transactions</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#DFA55D]">
              <h2 className="text-xl font-semibold mb-2 text-[#347486]">Card Payments</h2>
              <p className="text-2xl font-bold text-[#DFA55D]">{cardPayments}</p>
              <p className="text-gray-600">{cardPercentage}% of total</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#347486]">
              <h2 className="text-xl font-semibold mb-2 text-[#347486]">Cash Payments</h2>
              <p className="text-2xl font-bold text-[#347486]">{cashPayments}</p>
              <p className="text-gray-600">{cashPercentage}% of total</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden mb-8 border border-[#DFA55D]">
            <div className="px-6 py-4 border-b bg-[#347486] text-white">
              <h2 className="text-xl font-semibold">Payment Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#DFA55D]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Appointment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Card</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No payment records found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-[#DFA55D]/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{payment._id?.slice(-6)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {payment.appointment_id?._id?.slice(-6) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#BC4626]">
                          ${(payment.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          {payment.payment_method || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {payment.payment_method === 'Card' && payment.card_details?.card_number
                            ? `**** ${payment.card_details.card_number.slice(-4)}`
                            : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => generatePDFReceipt(payment)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#347486] hover:bg-[#347486]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#347486]"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={generateFullPaymentsPDF}
              disabled={payments.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                payments.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#BC4626] hover:bg-[#BC4626]/80'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC4626]`}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Financial Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentReviewPage;