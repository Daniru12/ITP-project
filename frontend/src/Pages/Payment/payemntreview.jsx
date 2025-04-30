import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText, CreditCard, DollarSign, CircleDollarSign, PieChart, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentReviewPage = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState({});
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
        
        // Initialize notification status for each payment
        const initialStatus = {};
        paymentsArray.forEach(payment => {
          initialStatus[payment._id] = payment.notification_sent || false;
        });
        setNotificationStatus(initialStatus);
        
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

  // Function to send WhatsApp notification
  const sendWhatsAppNotification = async (payment) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      if (!payment.user_phone && !payment.appointment_id?.user_id?.phone) {
        throw new Error('No phone number available for this payment');
      }
      
      const phoneNumber = payment.user_phone || payment.appointment_id?.user_id?.phone;
      const amount = payment.amount || 0;
      const receiptId = payment._id?.slice(-6) || 'N/A';
      const packageType = payment.package_type || payment.appointment_id?.package_type || 'N/A';
      
      // Prepare the message content
      const message = `Thank you for your payment of $${amount.toFixed(2)} for ${packageType}. Your receipt ID is ${receiptId}. If you have any questions, please contact our support team.`;
      
      // Send the notification request to your backend
      const response = await axios.post(
        `${backendUrl}/api/notifications/whatsapp`, 
        {
          phoneNumber: phoneNumber,
          message: message,
          paymentId: payment._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the notification status for this payment
      setNotificationStatus(prev => ({
        ...prev,
        [payment._id]: true
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw error;
    }
  };

  // Function to handle sending notification with UI feedback
  const handleSendNotification = async (payment) => {
    try {
      await sendWhatsAppNotification(payment);
      alert(`WhatsApp notification sent successfully to customer for payment ID: ${payment._id?.slice(-6)}`);
    } catch (error) {
      alert(`Failed to send WhatsApp notification: ${error.message}`);
    }
  };

  // Function to send notifications to all users who haven't received one
  const sendBulkNotifications = async () => {
    if (!confirm('Send WhatsApp notifications to all customers with unsent payment receipts?')) {
      return;
    }
    
    const unnotifiedPayments = payments.filter(payment => !notificationStatus[payment._id]);
    
    if (unnotifiedPayments.length === 0) {
      alert('All customers have already been notified.');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const payment of unnotifiedPayments) {
      try {
        await sendWhatsAppNotification(payment);
        successCount++;
      } catch (error) {
        console.error(`Failed to send notification for payment ${payment._id}:`, error);
        failCount++;
      }
    }
    
    alert(`Notifications sent: ${successCount} successful, ${failCount} failed.`);
  };

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
    // Existing PDF generation code...
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
      notificationStatus[p._id] ? 'Sent' : 'Not Sent'
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['ID', 'Appointment', 'Package', 'Amount', 'Method', 'Card', 'Date', 'Status', 'Notification']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [223, 165, 93] },  // #DFA55D - Sandy Gold
    });

    doc.save(`payments_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-[#BC4626] p-3 rounded-full mr-4">
            <CircleDollarSign size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#BC4626]">All Payment Records</h1>
        </div>
        <div className="hidden md:block">
          <img 
            src="/api/placeholder/180/60" 
            alt="Payment Logo" 
            className="h-12 rounded-md" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-[#DFA55D] border-t-transparent mb-4"></div>
          <p className="text-[#347486] font-medium">Loading payment data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-[#BC4626] p-6 rounded-lg mb-6 flex items-center">
          <div className="mr-4 p-2 bg-red-200 rounded-full">
            <PieChart className="text-[#BC4626]" size={24} />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Error Loading Data</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Banner Image */}
          <div className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-[#347486] to-[#BC4626] h-40 flex items-center">
            <div className="absolute inset-0 opacity-10">
              <img src="/api/placeholder/1200/200" alt="Financial background" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 px-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
              <p className="text-lg opacity-90">Total Revenue: <span className="font-bold">${totalRevenue.toFixed(2)}</span></p>
              <p className="text-sm opacity-75">From {payments.length} transactions</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#BC4626] flex items-start">
              <div className="bg-[#BC4626]/10 p-3 rounded-lg mr-4">
                <CircleDollarSign size={24} className="text-[#BC4626]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-[#347486]">Total Revenue</h2>
                <p className="text-2xl font-bold text-[#BC4626]">${totalRevenue.toFixed(2)}</p>
                <p className="text-gray-600">{payments.length} total transactions</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#DFA55D] flex items-start">
              <div className="bg-[#DFA55D]/10 p-3 rounded-lg mr-4">
                <CreditCard size={24} className="text-[#DFA55D]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-[#347486]">Card Payments</h2>
                <p className="text-2xl font-bold text-[#DFA55D]">{cardPayments}</p>
                <p className="text-gray-600">{cardPercentage}% of total</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-[#347486] flex items-start">
              <div className="bg-[#347486]/10 p-3 rounded-lg mr-4">
                <DollarSign size={24} className="text-[#347486]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-[#347486]">Cash Payments</h2>
                <p className="text-2xl font-bold text-[#347486]">{cashPayments}</p>
                <p className="text-gray-600">{cashPercentage}% of total</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex items-start">
              <div className="bg-green-500/10 p-3 rounded-lg mr-4">
                <MessageSquare size={24} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2 text-[#347486]">WhatsApp Notifications</h2>
                <p className="text-2xl font-bold text-green-500">
                  {Object.values(notificationStatus).filter(Boolean).length}
                </p>
                <p className="text-gray-600">
                  {payments.length > 0 
                    ? `${((Object.values(notificationStatus).filter(Boolean).length / payments.length) * 100).toFixed(1)}% sent` 
                    : '0% sent'}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Notification Control Panel */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8 border border-green-500">
            <div className="px-6 py-4 border-b bg-green-600 text-white flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="mr-2" size={20} />
                <h2 className="text-xl font-semibold">WhatsApp Notification Center</h2>
              </div>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {Object.values(notificationStatus).filter(Boolean).length} sent / {payments.length} total
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Automatic Payment Notifications</h3>
                  <p className="text-gray-600 text-sm mb-4">Send payment receipts directly to customers via WhatsApp</p>
                </div>
                <button
                  onClick={sendBulkNotifications}
                  disabled={payments.length === 0 || Object.values(notificationStatus).filter(Boolean).length === payments.length}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    payments.length === 0 || Object.values(notificationStatus).filter(Boolean).length === payments.length
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-4 md:mt-0`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send All Unsent Notifications
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden mb-8 border border-[#DFA55D]">
            <div className="px-6 py-4 border-b bg-[#347486] text-white flex items-center justify-between">
              <div className="flex items-center">
                <PieChart className="mr-2" size={20} />
                <h2 className="text-xl font-semibold">Payment Transactions</h2>
              </div>
              <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                {payments.length} records
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#DFA55D]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Appointment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BC4626] uppercase tracking-wider">Phone</th>
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
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <img src="/api/placeholder/80/80" alt="No data" className="mb-4 opacity-50" />
                          <p className="text-gray-500">No payment records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-[#DFA55D]/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{payment._id?.slice(-6)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {payment.appointment_id?._id?.slice(-6) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.user_phone || payment.appointment_id?.user_id?.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#BC4626]">
                          ${(payment.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {payment.payment_method === 'Card' ? (
                              <CreditCard size={14} className="mr-1 text-[#DFA55D]" />
                            ) : payment.payment_method?.toLowerCase().includes('cash') ? (
                              <DollarSign size={14} className="mr-1 text-[#347486]" />
                            ) : (
                              <CircleDollarSign size={14} className="mr-1 text-gray-400" />
                            )}
                            <span className="capitalize">{payment.payment_method || 'N/A'}</span>
                          </div>
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => generatePDFReceipt(payment)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-[#347486] hover:bg-[#347486]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#347486]"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Receipt
                            </button>
                            <button
                              onClick={() => handleSendNotification(payment)}
                              disabled={notificationStatus[payment._id]}
                              className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white ${
                                notificationStatus[payment._id]
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {notificationStatus[payment._id] ? 'Sent' : 'Notify'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={sendBulkNotifications}
              disabled={payments.length === 0 || Object.values(notificationStatus).filter(Boolean).length === payments.length}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                payments.length === 0 || Object.values(notificationStatus).filter(Boolean).length === payments.length
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send All WhatsApp Notifications
            </button>
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
      
      {/* Footer with image */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm">© 2025 Financial Management System</p>
          <div className="flex items-center mt-4 md:mt-0">
            <img src="https://i.postimg.cc/6qNSPZcz/4d03dcbf-fba9-43c7-a30d-18a0f1bc8cd2.png" alt="Payment partners" className="h-8" />
            <div className="mx-4 h-6 w-px bg-gray-300"></div>
            <div className="flex items-center">
              <CreditCard size={16} className="text-[#DFA55D] mr-1" />
              <DollarSign size={16} className="text-[#347486] mr-1" />
              <CircleDollarSign size={16} className="text-[#BC4626] mr-1" />
              <MessageSquare size={16} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReviewPage;