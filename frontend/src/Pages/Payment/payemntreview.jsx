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

  const sendWhatsAppMessage = (phone, receiptId) => {
    const fallbackPhone = '+94702324295'; // default if user phone is missing
    const recipient = phone || fallbackPhone;
    const message = `Your payment receipt (${receiptId}) has been successfully generated. Thank you for your payment!`;

    const url = `https://web.whatsapp.com/send?phone=${recipient}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const generatePDFReceipt = (payment) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = 'https://i.postimg.cc/6qNSPZcz/4d03dcbf-fba9-43c7-a30d-18a0f1bc8cd2.png';

    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 30, 30);
      doc.setFillColor(52, 116, 134);
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
      doc.setDrawColor(188, 70, 38);
      doc.line(20, y, 190, y);
      y += 10;

      doc.setFontSize(10);
      doc.text('Thank you for your payment!', 105, y, null, null, 'center');

      doc.save(`payment_receipt_${receiptId}.pdf`);

      // Extract phone number and send WhatsApp message
      const userPhone = payment.user?.phone || payment.phone;
      sendWhatsAppMessage(userPhone, receiptId);
    };
  };

  const generateFullPaymentsPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(188, 70, 38);
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
      headStyles: { fillColor: [223, 165, 93] },
    });

    doc.save(`payments_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-[#347486] mb-8">Payment Records</h1>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#DFA55D] border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-[#BC4626]/10 text-[#BC4626] p-4 rounded-lg mb-6 border border-[#BC4626]/20">
          {error}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate('/Appointment')}
              className="inline-flex items-center px-4 py-2 text-[#347486] border border-[#347486] hover:bg-[#f0f8fa] font-semibold rounded-md transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Appointments
            </button>
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-[#347486]">
                <tr>
                  {['ID', 'Appointment', 'Amount', 'Method', 'Card', 'Date', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
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
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-[#347486]/5">
                      <td className="px-6 py-4 font-mono text-sm">{p._id?.slice(-6)}</td>
                      <td className="px-6 py-4 font-mono text-sm">{p.appointment_id?._id?.slice(-6) || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#BC4626]">${(p.amount || 0).toFixed(2)}</td>
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
                          className="inline-flex items-center px-3 py-1 text-white font-medium rounded-md bg-[#347486] hover:bg-[#347486]/80 transition-colors"
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
                  : 'bg-[#BC4626] hover:bg-[#DFA55D] transition-colors duration-300'
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              Export Financial Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentReviewPage;
