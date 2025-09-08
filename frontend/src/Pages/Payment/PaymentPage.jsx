import React, { useState } from 'react'
import ServiceSummary from './AppointmentSummary'
import PaymentForm from './PaymentForm'
import OrderSummary from './OrderSummary'
import { ArrowLeftIcon } from 'lucide-react'


const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('credit')
  // Sample data - in a real app this would come from your state management or API
  const serviceData = {
    name: 'Pet Sitting',
    description: 'In-home pet sitting service',
    date: 'May 15, 2023',
    time: '10:00 AM - 2:00 PM',
    duration: '4 hours',
    pet: {
      name: 'Max',
      type: 'Dog',
      breed: 'Golden Retriever',
      image:
        'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z29sZGVuJTIwcmV0cmlldmVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    },
    provider: {
      name: 'Sarah Johnson',
      rating: 4.9,
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    },
    price: 45.0,
    serviceFee: 5.0,
  }
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }
  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-96">
      <h2 className="text-lg font-bold mb-4">Payment Form</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="appointment_id" placeholder="Appointment ID" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="text" name="user_id" placeholder="User ID" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="text" name="pet_id" placeholder="Pet ID" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="text" name="service_id" placeholder="Service ID" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="number" name="amount" placeholder="Amount" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        
        <h3 className="text-md font-semibold">Card Details</h3>
        <input type="text" name="card_number" placeholder="Card Number" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="text" name="card_holder_name" placeholder="Card Holder Name" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="text" name="expiration_date" placeholder="Expiration Date (MM/YY)" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />
        <input type="text" name="cvv" placeholder="CVV" onChange={handleChange} required className="w-full p-2 mb-2 border rounded" />

        <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-3 rounded">Submit Payment</button>
      </form>
    </div>
  );
};

export default PaymentPage;
