import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Fix: Import jsPDF correctly
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

      // Try different common API endpoint patterns
      // First try /api/v1/payments (common versioned API pattern)
      let response;
      let endpoint;
      
      try {
        endpoint = `/api/v1/payments`;
        console.log(`Trying: ${backendUrl}${endpoint}`);
        response = await axios.get(`${backendUrl}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (endpointErr) {
        if (endpointErr.response && endpointErr.response.status === 404) {
          // Try /payments (simple REST pattern)
          try {
            endpoint = `/payments`;
            console.log(`Trying: ${backendUrl}${endpoint}`);
            response = await axios.get(`${backendUrl}${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (simpleEndpointErr) {
            if (simpleEndpointErr.response && simpleEndpointErr.response.status === 404) {
              // Fall back to original /api/payments pattern
              endpoint = `/api/payments`;
              console.log(`Trying: ${backendUrl}${endpoint}`);
              response = await axios.get(`${backendUrl}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } else {
              throw simpleEndpointErr;
            }
          }
        } else {
          throw endpointErr;
        }
      }
      
      console.log(`Successfully connected to: ${backendUrl}${endpoint}`);
      
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
      console.error('Error fetching payments:', err, err.response);
      
      // More helpful error message
      if (err.response && err.response.status === 404) {
        setError('API endpoint not found. The application tried multiple common endpoint paths but none worked. Please check your API configuration.');
      } else if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.message === 'Network Error') {
        setError('Network error: Cannot connect to the backend server. Please ensure the server is running.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch payments');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const downloadSinglePaymentPDF = (payment) => {
    try {
      console.log('Generating receipt for payment:', payment);
      
      // Fix: Create jsPDF instance correctly
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Payment Receipt', 105, 20, { align: 'center' });
      
      // Add payment details - safely handle potential undefined values
      const paymentId = payment._id ? (typeof payment._id === 'string' ? payment._id.slice(-6) : payment._id) : 'N/A';
      const paymentDate = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A';
      const appointmentId = payment.appointment_id && payment.appointment_id._id 
        ? payment.appointment_id._id.slice(-6) 
        : 'N/A';
      const amount = isNaN(payment.amount) ? '0.00' : payment.amount.toFixed(2);
      const method = payment.payment_method || 'N/A';
      
      doc.setFontSize(12);
      doc.text(`Receipt ID: ${paymentId}`, 20, 40);
      doc.text(`Date: ${paymentDate}`, 20, 50);
      doc.text(`Appointment ID: ${appointmentId}`, 20, 60);
      
      // Payment info
      doc.setFontSize(14);
      doc.text('Payment Information', 20, 80);
      doc.setFontSize(12);
      doc.text(`Amount: $${amount}`, 30, 90);
      doc.text(`Method: ${method}`, 30, 100);
      
      // Card details if applicable
      if (payment.payment_method === 'Card' && payment.card_details?.card_number) {
        doc.text(`Card: •••• ${payment.card_details.card_number.slice(-4)}`, 30, 110);
      }
      
      // Add timestamp and signature line
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 140);
      
      doc.line(20, 160, 100, 160);
      doc.text('Authorized Signature', 20, 170);
      
      // Add a border around the receipt
      doc.rect(10, 10, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
      
      // Save with unique filename
      const filename = `payment_receipt_${paymentId}_${new Date().getTime()}.pdf`;
      console.log('Saving receipt as:', filename);
      doc.save(filename);
      console.log('Receipt generated successfully');
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert('Error generating payment receipt. See console for details.');
    }
  };

  const downloadPDF = () => {
    try {
      console.log('Download PDF function triggered');
      console.log('Number of payments:', payments.length);
      
      if (!payments || payments.length === 0) {
        console.warn('No payments available to generate report');
        alert('No payment data available to generate report');
        return;
      }
      
      // Fix: Create jsPDF instance correctly
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text('Financial Report', 105, 15, { align: 'center' });
      
      // Add current date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated: ${currentDate}`, 195, 10, { align: 'right' });
      
      // Return to normal font size
      doc.setFontSize(12);

      // Create table data from payments
      const tableData = payments.map(p => {
        // Safely access nested properties
        const paymentId = p._id ? (typeof p._id === 'string' ? p._id.slice(-6) : 'N/A') : 'N/A';
        const appointmentId = p.appointment_id && p.appointment_id._id ? p.appointment_id._id.slice(-6) : 'N/A';
        const amount = isNaN(p.amount) ? '0.00' : p.amount.toFixed(2);
        const method = p.payment_method || 'N/A';
        const card = p.payment_method === 'Card' && p.card_details?.card_number 
          ? `**** ${p.card_details.card_number.slice(-4)}` 
          : 'N/A';
        const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A';
        
        return [paymentId, appointmentId, `$${amount}`, method, card, date];
      });

      // Fix: Make sure autoTable plugin is properly initialized
      if (typeof doc.autoTable !== 'function') {
        console.error('autoTable plugin not properly initialized');
        throw new Error('PDF autotable plugin not available');
      }

      doc.autoTable({
        head: [['ID', 'Appointment', 'Amount', 'Method', 'Card', 'Date']],
        body: tableData,
        startY: 25,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [52, 116, 134], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 244, 248] }
      });

      const finalY = doc.lastAutoTable.finalY || 30;

      // Safely calculate totals
      const totalAmount = payments.reduce((sum, p) => sum + (isNaN(p.amount) ? 0 : Number(p.amount)), 0);
      const totalCash = payments
        .filter(p => p.payment_method === 'Cash')
        .reduce((sum, p) => sum + (isNaN(p.amount) ? 0 : Number(p.amount)), 0);
      const totalCard = payments
        .filter(p => p.payment_method === 'Card')
        .reduce((sum, p) => sum + (isNaN(p.amount) ? 0 : Number(p.amount)), 0);

      doc.text(`Total Payments: ${payments.length}`, 14, finalY + 10);
      doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 14, finalY + 20);
      doc.text(`- Cash Payments: $${totalCash.toFixed(2)}`, 14, finalY + 30);
      doc.text(`- Card Payments: $${totalCard.toFixed(2)}`, 14, finalY + 40);

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      // Save the PDF
      const filename = `financial_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      console.log('Saving PDF as:', filename);
      doc.save(filename);
      console.log('PDF generated successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF report. See console for details.');
    }
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
                          ? `•••• ${p.card_details.card_number.slice(-4)}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => downloadSinglePaymentPDF(p)}
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
              onClick={downloadPDF}
              disabled={payments.length === 0}
              className={`inline-flex items-center px-5 py-3 text-white font-semibold rounded-md shadow ${
                payments.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Download className="h-5 w-5 mr-2" />
              Download Full Report
            </button>
          </div>
          
         
        </>
      )}
    </div>
  );
};

export default PaymentReviewPage;