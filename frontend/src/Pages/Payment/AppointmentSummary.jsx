import React from 'react';

const AppointmentSummary = ({ service, packageType, discountApplied, pet, owner, appointmentDate }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Appointment Summary</h3>

      {/* Service Summary */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Service Summary</h4>
        <div className="mt-2">
          <p className="text-gray-600 text-sm">Service: {service?.service_name || 'Unknown'}</p>
          <p className="text-gray-600 text-sm">Package: {packageType || 'N/A'}</p>
          <p className="text-gray-600 text-sm">Discount Applied: ${discountApplied ?? 0}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800">Order Summary</h4>
        <div className="mt-2">
          <p className="text-gray-600 text-sm">Pet: {pet?.name || 'Unknown'}</p>
          <p className="text-gray-600 text-sm">Owner: {owner?.full_name || 'Unknown'}</p>
          <p className="text-gray-600 text-sm">Contact: {owner?.phone_number || 'Unknown'}</p>
          <p className="text-gray-600 text-sm">Appointment Date: {appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'No Date'}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSummary;
