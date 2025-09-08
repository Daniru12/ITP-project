import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import ServiceSummary from './AppointmentSummary'; // Import the ServiceSummary component
import OrderSummary from './OrderSummary'; // Import the OrderSummary component

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await axios.get(`${backendUrl}/api/appointments/provider`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          if (response.data.appointments && response.data.appointments.length > 0) {
            setAppointments(response.data.appointments);
          } else {
            setMessage(response.data.message || "You don't have any appointments yet.");
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching appointments:', error);
          setError(error.response?.data?.message || 'Failed to load appointments');
          toast.error('Failed to load appointments');
          setLoading(false);
        }
      }
    };

    fetchAppointments();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirm = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.put(
        `${backendUrl}/api/appointments/${appointmentId}`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Appointment confirmed!');
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: 'confirmed' } : appt
        )
      );
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.put(
        `${backendUrl}/api/appointments/${appointmentId}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Appointment cancelled!');
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: 'cancelled' } : appt
        )
      );
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-blue-500">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Upcoming Appointments</h2>

        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => {
              const service = appointment.service_id || {};
              const pet = appointment.pet_id || {};
              const owner = pet.owner_id || {};

              return (
                <div
                  key={appointment._id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      {appointment.appointment_date
                        ? new Date(appointment.appointment_date).toLocaleDateString()
                        : 'No Date'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(appointment.status)}`}>
                      {appointment.status || 'Unknown'}
                    </span>
                  </div>

                  <ServiceSummary
                    service={service}
                    packageType={appointment.package_type}
                    discountApplied={appointment.discount_applied}
                  />

                  <OrderSummary
                    pet={pet}
                    owner={owner}
                    appointmentDate={appointment.appointment_date}
                  />

                  <div className="flex justify-end space-x-2 mt-4">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(appointment._id)}
                        className="flex items-center bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full text-sm transition"
                      >
                        <FaCheck className="mr-1" /> Confirm
                      </button>
                    )}
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        className="flex items-center bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-sm transition"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
