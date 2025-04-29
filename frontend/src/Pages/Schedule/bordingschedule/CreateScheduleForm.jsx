import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

// CSS Variables for consistent theming
const styles = {
  root: `bg-gradient-to-br from-white to-orange-50 min-h-screen p-6`,
  card: `max-w-4xl mx-auto mt-10 bg-white p-8 shadow-lg rounded-xl border border-orange-100`,
  heading: `text-3xl font-bold text-center mb-6 text-[#BC4626]`,
  label: `block font-medium mb-2 text-gray-700`,
  input: `w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D] outline-none transition duration-200`,
  select: `w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D] outline-none transition duration-200 bg-white`,
  button: `bg-[#BC4626] hover:bg-[#a03b20] text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg`,
  formGroup: `mb-6`,
  divider: `my-6 border-t border-gray-200`,
  durationBadge: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#347486] text-white mb-2`,
  cancelButton: `border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg transition duration-200 hover:bg-gray-100`,
  petInfoCard: `mb-6 p-5 bg-orange-50 rounded-lg border-l-4 border-[#BC4626] shadow-sm`,
  formContainer: `md:grid md:grid-cols-2 md:gap-8`,
  buttonContainer: `flex flex-row justify-end space-x-4 mt-8`,
  pageTitle: `text-sm uppercase tracking-wider text-gray-500 mb-2`,
  calendar: `w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#DFA55D] focus:border-[#DFA55D] outline-none transition duration-200 bg-white`,
  durationContainer: `p-4 bg-gray-50 rounded-lg border border-gray-200`,
  durationDescription: `mt-2 text-sm text-gray-600 italic`,
  stepIndicator: `flex items-center justify-center mb-8`,
  stepBadge: `flex items-center justify-center w-8 h-8 rounded-full bg-[#BC4626] text-white font-bold`,
  stepText: `ml-2 text-gray-700 font-medium`,
};

const CreateBoardingScheduleForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const appointmentDetails = state?.appointmentDetails;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: '',
    service_id: '',
    appointment_id: '',
    duration: 'day',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    if (appointmentDetails) {
      setFormData((prev) => ({
        ...prev,
        pet_id: appointmentDetails.pet_id?._id,
        service_id: appointmentDetails.service_id?._id,
        appointment_id: appointmentDetails._id,
      }));
    }
  }, [appointmentDetails]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getDurationDescription = () => {
    switch (formData.duration) {
      case 'day': return 'Standard day boarding (8 hours)';
      case 'overnight': return 'Overnight stay (12 hours)';
      case 'weekday': return '5-day weekday boarding';
      case 'weekend': return '2-day weekend boarding';
      case 'custom': return 'Custom duration boarding';
      default: return '';
    }
  };

  const getDurationDetails = () => {
    switch (formData.duration) {
      case 'day': return 'Your pet will be cared for during regular business hours (8 hours). Perfect for busy workdays.';
      case 'overnight': return 'Includes evening care and overnight supervision (12 hours total). Your pet will have comfortable sleeping arrangements.';
      case 'weekday': return 'Monday through Friday boarding for pets requiring extended care. Includes all meals and multiple play sessions daily.';
      case 'weekend': return 'Saturday and Sunday boarding service. Includes all meals and extra enrichment activities.';
      case 'custom': return 'Specify your exact boarding duration with custom start and end times that fit your schedule.';
      default: return '';
    }
  };

  const validateForm = () => {
    const now = new Date();
    const startTime = new Date(formData.start_time);

    if (!formData.start_time) {
      toast.error("Start date is required");
      return false;
    }

    if (startTime < now) {
      toast.error("Start date cannot be in the past");
      return false;
    }

    if (formData.duration === 'custom') {
      if (!formData.end_time) {
        toast.error("End date is required for custom duration");
        return false;
      }
      const endTime = new Date(formData.end_time);
      if (endTime <= startTime) {
        toast.error("End date must be after start date");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const payload = { ...formData };

      if (formData.duration !== 'custom') {
        delete payload.end_time;
      }

      await axios.post(
        `${backendUrl}/api/scheduling/bordingschedule/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Boarding schedule created successfully!");
      navigate("/schedule/boarding");
    } catch (error) {
      console.error("Scheduling error:", error);
      toast.error(error.response?.data?.error || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const minDateTime = new Date().toISOString().slice(0,16);

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        
      
        <h2 className={styles.heading}>Create Boarding Schedule</h2>
        <p className="text-center text-gray-600 mb-8">Schedule a boarding appointment for your pet</p>
        
        {appointmentDetails && appointmentDetails.pet_id && (
          <div className={styles.petInfoCard}>
            <div className="flex items-center justify-between">
              <div>
                <p className={styles.pageTitle}>PET INFORMATION</p>
                <div className="font-bold text-xl text-gray-800">{appointmentDetails.pet_id.name}</div>
                {appointmentDetails.service_id && (
                  <div className="text-gray-600"> {appointmentDetails.service_id.name}</div>
                )}
              </div>
              <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center text-2xl font-bold text-orange-800">
                {appointmentDetails.pet_id.name.charAt(0)}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.divider}></div>
          
          <div className={styles.formContainer}>
            <div className="md:col-span-1">
              <div className={styles.durationContainer}>
                <label className={styles.label}>
                  <span className={styles.pageTitle}>SELECT BOARDING TYPE</span>
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="day">Day Boarding (8h)</option>
                  <option value="overnight">Overnight Stay (12h)</option>
                  <option value="weekday">Weekday Package (5 days)</option>
                  <option value="weekend">Weekend Package (2 days)</option>
                  <option value="custom">Custom Duration</option>
                </select>
                
                <div className="mt-4">
                  <span className={styles.durationBadge}>{getDurationDescription()}</span>
                  <p className={styles.durationDescription}>{getDurationDetails()}</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 mt-6 md:mt-0">
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span className={styles.pageTitle}>START DATE & TIME</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  min={minDateTime}
                  className={styles.calendar}
                />
              </div>

              {formData.duration === 'custom' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.pageTitle}>END DATE & TIME</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    min={formData.start_time || minDateTime}
                    className={styles.calendar}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={handleCancel} 
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.button} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Schedule...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardingScheduleForm;