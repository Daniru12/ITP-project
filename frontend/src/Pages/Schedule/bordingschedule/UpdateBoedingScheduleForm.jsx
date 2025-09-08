import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Custom color theme variables
const colors = {
  primary: '#BC4626',    // Terracotta Red
  secondary: '#DFA55D',  // Sandy Gold
  accent: '#347486',     // Teal Blue
  white: '#FFFFFF',      // White
};

const UpdateBoardingScheduleForm = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    pet_id: '',
    service_id: '',
    appointment_id: '',
    duration: 'custom',  // Default set to "custom"
    start_time: '',
    end_time: '',
    status: 'Scheduled',  // Default status
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const res = await axios.get(`${backendUrl}/api/scheduling/bordingschedule/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data || res.data;

        // Set form data
        setFormData({
          pet_id: data.pet_id?._id || data.pet_id || '',
          service_id: data.service_id?._id || data.service_id || '',
          appointment_id: data.appointment_id?._id || data.appointment_id || '',
          duration: 'custom', // Automatically set to "custom"
          start_time: data.start_time?.slice(0, 16) || '',
          end_time: data.end_time?.slice(0, 16) || '',
          status: data.status || 'Scheduled', // Default status if not provided
        });
      } catch (err) {
        console.error('Failed to load schedule:', err);
        toast.error('Failed to load schedule details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [id]);

  const isFutureDateTime = (datetimeStr) => {
    const selected = new Date(datetimeStr);
    const now = new Date();
    return selected > now;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pet_id) {
      newErrors.pet_id = 'Pet information is missing';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Service information is missing';
    }

    if (!formData.appointment_id) {
      newErrors.appointment_id = 'This schedule is missing a linked appointment';
    }

    if (!isFutureDateTime(formData.start_time)) {
      newErrors.start_time = 'Start time must be in the future';
    }

    if (formData.duration === 'custom' && !isFutureDateTime(formData.end_time)) {
      newErrors.end_time = 'End time must be in the future';
    }

    if (formData.duration === 'custom' && new Date(formData.end_time) <= new Date(formData.start_time)) {
      newErrors.end_time = 'End time must be after start time';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      // Prepare the payload with the correct date format
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(), // Ensure end_time is included for custom durations
      };

      console.log('Sending payload:', payload);  // Log the payload to check data

      const response = await axios.put(`${backendUrl}/api/scheduling/bordingschedule/update/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Boarding schedule updated successfully!');
      navigate('/schedule/boarding');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update boarding schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/schedule/boarding');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 mx-auto max-w-5xl">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto"
            style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}
          ></div>
          <p className="mt-4 text-gray-600">Loading schedule information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 bg-white rounded-xl shadow-md overflow-hidden" style={{ margin: '0 auto',paddingTop:80 }}>
      <div className="md:flex">
        <div className="md:w-1/3 p-6" style={{ backgroundColor: `${colors.secondary}15` }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>Update Boarding</h2>

          <div className="mb-6">
            <div className="text-sm uppercase font-bold tracking-wide mb-1" style={{ color: colors.accent }}>
              Current Plan
            </div>
            <div className="text-gray-700 font-medium">Custom duration (specify end time)</div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm" style={{ borderColor: `${colors.secondary}50`, borderWidth: '1px' }}>
              <div className="text-sm uppercase font-bold tracking-wide" style={{ color: colors.accent }}>
                Important Notes
              </div>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• All times must be in the future</li>
                <li>• For custom durations, specify both start and end times</li>
                <li>• Changes may affect billing and availability</li>
              </ul>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.secondary,
                color: colors.accent,
                backgroundColor: colors.white,
              }}
            >
              Cancel Changes
            </button>
          </div>
        </div>

        <div className="md:w-2/3 p-6">
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1 text-gray-700">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded-md p-2 focus:ring-2"
                  style={{
                    borderColor: errors.start_time ? colors.primary : 'gray-300',
                    backgroundColor: errors.start_time ? `${colors.primary}10` : 'white',
                    ":focus": { ringColor: colors.primary, borderColor: colors.primary },
                  }}
                />
                {errors.start_time && <p className="mt-1 text-sm" style={{ color: colors.primary }}>{errors.start_time}</p>}
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-700">End Date & Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  min={formData.start_time || new Date().toISOString().slice(0, 16)}
                  className="w-full border rounded-md p-2 focus:ring-2"
                  style={{
                    borderColor: errors.end_time ? colors.primary : 'gray-300',
                    backgroundColor: errors.end_time ? `${colors.primary}10` : 'white',
                    ":focus": { ringColor: colors.primary, borderColor: colors.primary },
                  }}
                />
                {errors.end_time && <p className="mt-1 text-sm" style={{ color: colors.primary }}>{errors.end_time}</p>}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.secondary,
                  color: colors.accent,
                  backgroundColor: colors.white,
                  ":hover": { backgroundColor: `${colors.secondary}15` },
                  ":focus": { ringColor: colors.secondary },
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                  ":hover": { backgroundColor: `${colors.primary}DD` },
                  ":focus": { ringColor: colors.primary },
                }}
              >
                {isLoading ? 'Updating...' : 'Update Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateBoardingScheduleForm;
