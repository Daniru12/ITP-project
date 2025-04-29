import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const CreateGroomingScheduleForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const appointmentDetails = state?.appointmentDetails;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: '',
    service_id: '',
    appointment_id: '',
    Period: '30min',
    start_time: '',
    special_requests: '',
    notes: '',
  });

  // Helper to get current local datetime in 'YYYY-MM-DDTHH:mm' format
  const getLocalDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!appointmentDetails) {
      toast.error("Appointment details not provided.");
      return;
    }

    console.log("Loaded appointment details:", appointmentDetails);

    setFormData((prev) => ({
      ...prev,
      pet_id: appointmentDetails.pet_id?._id || '',
      service_id: appointmentDetails.service_id?._id || '',
      appointment_id: appointmentDetails._id || '',
    }));
  }, [appointmentDetails]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { pet_id, service_id, appointment_id, start_time } = formData;

    if (!pet_id || !service_id || !appointment_id || !start_time) {
      toast.error("All required fields must be filled");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.post(
        `${backendUrl}/api/scheduling/groomingschedule/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Grooming schedule created successfully!");
      navigate("/schedule/grooming");
    } catch (error) {
      console.error("Scheduling error:", error);
      toast.error(error.response?.data?.error || "Failed to create schedule");
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !formData.pet_id || !formData.service_id || !formData.appointment_id || !formData.start_time || isSubmitting;

  // Pet and service details display if available
  const petName = appointmentDetails?.pet_id?.name || 'Pet';
  const serviceType = appointmentDetails?.service_id?.name || 'Service';

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-t-2xl p-6 md:p-8 shadow-lg">
          <div className="flex items-center">
            <div className="bg-amber-500 p-3 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-white">Create Grooming Schedule</h1>
              <p className="text-teal-100 mt-1">Schedule professional grooming service for {petName}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 md:p-8 relative">
          {/* Appointment Info Card */}
          <div className="absolute -top-6 right-8 bg-white px-6 py-4 rounded-lg shadow-md border-l-4 border-amber-500">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-sm text-gray-500">Pet</div>
                <div className="font-semibold text-gray-800">{petName}</div>
              </div>
              <div className="mx-4 h-10 border-l border-gray-200"></div>
              <div>
                <div className="text-sm text-gray-500">Service</div>
                <div className="font-semibold text-gray-800">{serviceType}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-12">
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left column */}
              <div>
                <h3 className="font-semibold text-xl text-amber-700 mb-6 flex items-center">
                  <span className="bg-amber-100 p-1 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Timing Details
                </h3>

                {/* Period Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="Period"
                      value={formData.Period}
                      onChange={handleChange}
                      className="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    >
                      <option value="30min">30 Minutes</option>
                      <option value="1hour">1 Hour</option>
                      <option value="2hours">2 Hours</option>
                      <option value="custom">Custom Duration</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                      min={getLocalDatetime()}
                      className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div>
                <h3 className="font-semibold text-xl text-teal-700 mb-6 flex items-center">
                  <span className="bg-teal-100 p-1 rounded-md mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Special Instructions
                </h3>

                {/* Special Requests */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Special Requests
                  </label>
                  <textarea
                    name="special_requests"
                    placeholder="Use organic shampoo, special treatment for sensitive skin, specific grooming style..."
                    value={formData.special_requests}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 h-32 resize-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    placeholder="Pet behavior information, previous grooming experiences, or any other details we should know..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 h-32 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 border-t border-gray-100 pt-6 flex flex-col sm:flex-row-reverse justify-between items-center">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`w-full sm:w-auto ${
                  isSubmitDisabled
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700'
                } text-white text-lg font-semibold py-3 px-8 rounded-lg transition duration-300 shadow-md sm:ml-4 mb-4 sm:mb-0`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Schedule Appointment'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroomingScheduleForm;