import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CreateTrainingScheduleForm = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const appointmentDetails = state?.appointmentDetails;

  // Form step state
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    appointment_id: '',
    pet_id: '',
    service_id: '',
    week_start_date: '',
    schedule: [],
  });

  const [newSession, setNewSession] = useState({
    day: 'Monday',
    time: '',
    training_type: '',
    duration: '1hour',
    notes: '',
  });

  const [activeDay, setActiveDay] = useState('Monday');

  const todayStr = new Date().toISOString().split('T')[0]; // format: 'YYYY-MM-DD'

  useEffect(() => {
    if (!appointmentDetails) {
      toast.error('Appointment details not provided.');
      return;
    }

    console.log('📦 Loaded appointment details:', appointmentDetails);

    setFormData((prev) => ({
      ...prev,
      appointment_id: appointmentDetails._id || '',
      pet_id: appointmentDetails.pet_id?._id || '',
      service_id: appointmentDetails.service_id?._id || '',
    }));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSessionChange = (e) => {
    const { name, value } = e.target;

    if (name === 'day') {
      setActiveDay(value);
    }

    setNewSession((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Convert 24h time to 12h format with AM/PM
  const formatTime = (time24h) => {
    if (!time24h) return '';
    
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  const handleAddSession = () => {
    if (!newSession.time || !newSession.training_type) {
      toast.error('Please provide time and training type.');
      return;
    }

    const formattedTime = formatTime(newSession.time);
    
    const existingDay = formData.schedule.find((d) => d.day === newSession.day);
    const session = { ...newSession, time: formattedTime, status: 'Scheduled' };
    let updatedSchedule;

    if (existingDay) {
      existingDay.sessions.push(session);
      updatedSchedule = [...formData.schedule];
    } else {
      updatedSchedule = [
        ...formData.schedule,
        {
          day: newSession.day,
          sessions: [session],
        },
      ];
    }

    setFormData((prev) => ({
      ...prev,
      schedule: updatedSchedule,
    }));

    setNewSession((prev) => ({
      ...prev,
      time: '',
      training_type: '',
      notes: '',
    }));
    toast.success('Session added successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { appointment_id, pet_id, service_id, week_start_date, schedule } = formData;

    const today = new Date();
    const selectedDate = new Date(week_start_date);

    if (selectedDate < new Date(today.setHours(0, 0, 0, 0))) {
      toast.error('Week start date cannot be in the past.');
      return;
    }

    if (!appointment_id || !pet_id || !service_id || !week_start_date || schedule.length === 0) {
      toast.error('All fields required and at least one session must be added.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.post(`${backendUrl}/api/scheduling/trainingschedule/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('✅ Training schedule created!');
      navigate('/schedule/training');
    } catch (error) {
      console.error('❌ Schedule error:', error);
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    }
  };

  // Function to remove a session
  const handleRemoveSession = (dayIndex, sessionIndex) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[dayIndex].sessions.splice(sessionIndex, 1);
    
    // Remove the day entirely if no sessions remain
    if (updatedSchedule[dayIndex].sessions.length === 0) {
      updatedSchedule.splice(dayIndex, 1);
    }
    
    setFormData((prev) => ({
      ...prev,
      schedule: updatedSchedule,
    }));
    
    toast.success('Session removed');
  };

  // Get sessions for a specific day
  const getSessionsForDay = (day) => {
    const daySchedule = formData.schedule.find(d => d.day === day);
    return daySchedule ? daySchedule.sessions : [];
  };

  // Function to set day tab as active
  const setDayTab = (day) => {
    setActiveDay(day);
    setNewSession(prev => ({
      ...prev,
      day: day
    }));
  };

  // Count sessions per day
  const getSessionCount = (day) => {
    const daySchedule = formData.schedule.find(d => d.day === day);
    return daySchedule ? daySchedule.sessions.length : 0;
  };

  // Count total sessions
  const getTotalSessions = () => {
    return formData.schedule.reduce((total, day) => total + day.sessions.length, 0);
  };

  // Proceed to next step
  const nextStep = () => {
    if (!formData.week_start_date) {
      toast.error('Please select a week start date.');
      return;
    }
    setCurrentStep(2);
  };

  // Go back to first step
  const prevStep = () => {
    setCurrentStep(1);
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl" style={{ maxWidth: '1000px', margin: '40px auto' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ backgroundColor: '#347486', borderRadius: '0.75rem 0.75rem 0 0' }}>
        <h2 className="text-2xl font-bold text-white">Create Pet Training Schedule</h2>
        <div className="flex items-center mt-2">
          <div className="flex-1">
            <p className="text-white text-opacity-80">
              {currentStep === 1 ? 'Step 1: Set Training Week' : 'Step 2: Add Training Sessions'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-8 rounded-full ${currentStep >= 1 ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
            <div className={`h-2 w-8 rounded-full ${currentStep >= 2 ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Set Training Week */}
        {currentStep === 1 && (
          <div className="p-6">
            <div className="max-w-md mx-auto">
              <div className="mb-6 text-center">
                <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: 'rgba(223, 165, 93, 0.15)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DFA55D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Select Training Week Start Date</h3>
                <p className="text-gray-500">Choose when you want to start the training schedule</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <label className="block mb-2 font-medium text-gray-700">Week Beginning</label>
                <input
                  type="date"
                  name="week_start_date"
                  min={todayStr}
                  value={formData.week_start_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring"
                  style={{ borderColor: '#DFA55D' }}
                />
                {formData.week_start_date && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                    <p className="font-medium" style={{ color: '#347486' }}>Selected Week: </p>
                    <p className="text-gray-700">{formatDate(formData.week_start_date)}</p>
                  </div>
                )}
              </div>

              {/* Pet Details Preview - Service name removed */}
              {appointmentDetails && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(52, 116, 134, 0.1)' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#347486' }}>Appointment Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Pet Name:</p>
                      <p className="font-medium">{appointmentDetails.pet_id?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-4 px-6 font-semibold text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
                style={{ backgroundColor: '#347486' }}
              >
                Continue to Add Sessions
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Training Sessions */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span className="ml-1">Back</span>
              </button>
              <div className="text-center">
                <p className="font-medium text-gray-700">Week Starting: {formatDate(formData.week_start_date)}</p>
              </div>
              <div className="flex items-center gap-1 text-sm" style={{ color: '#347486' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span>{getTotalSessions()} sessions added</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left Column - Form Controls */}
              <div className="md:w-1/3 p-6 border-r border-gray-200">
                <div className="sticky top-0">
                  <h3 className="font-semibold mb-4" style={{ color: '#347486' }}>Add New Session</h3>
                  
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Select Day</label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDayTab(day)}
                          className={`text-xs py-1 px-2 rounded-full ${activeDay === day ? 'text-white' : 'text-gray-600 bg-gray-100'}`}
                          style={{ backgroundColor: activeDay === day ? '#DFA55D' : '' }}
                        >
                          {day.substring(0, 3)}
                          {getSessionCount(day) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white text-gray-700">
                              {getSessionCount(day)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Training Time</label>
                      {/* Changed from text input to time input */}
                      <input
                        type="time"
                        name="time"
                        value={newSession.time}
                        onChange={handleSessionChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
                        style={{ borderColor: '#DFA55D' }}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Training Type</label>
                      <input
                        type="text"
                        name="training_type"
                        placeholder="e.g. Obedience, Agility"
                        value={newSession.training_type}
                        onChange={handleSessionChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
                        style={{ borderColor: '#DFA55D' }}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Duration</label>
                      <select
                        name="duration"
                        value={newSession.duration}
                        onChange={handleSessionChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
                        style={{ borderColor: '#DFA55D' }}
                      >
                        <option value="30min">30 minutes</option>
                        <option value="1hour">1 hour</option>
                        <option value="2hours">2 hours</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Session Notes</label>
                      <textarea
                        name="notes"
                        placeholder="Additional details about the session"
                        value={newSession.notes}
                        onChange={handleSessionChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring"
                        style={{ borderColor: '#DFA55D' }}
                        rows="3"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSession}
                    className="w-full py-3 px-4 mt-5 rounded-lg font-medium text-white transition-all hover:bg-opacity-90 shadow-sm"
                    style={{ backgroundColor: '#DFA55D' }}
                  >
                    Add to Schedule
                  </button>

                  {getTotalSessions() > 0 && (
                    <button
                      type="submit"
                      className="w-full py-4 px-6 mt-5 font-bold text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
                      style={{ backgroundColor: '#347486' }}
                    >
                      Complete Schedule
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column - Weekly Schedule */}
              <div className="md:w-2/3 p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#347486' }}>
                    {activeDay}'s Sessions
                  </h3>
                  <div className="text-sm bg-white px-3 py-1 rounded-full border" style={{ borderColor: '#DFA55D' }}>
                    {getTotalSessions()} total sessions
                  </div>
                </div>

                {/* Day selection tabs - Enhanced UI */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden">
                  <div className="flex overflow-x-auto">
                    {daysOfWeek.map((day) => {
                      const count = getSessionCount(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDayTab(day)}
                          className={`px-4 py-3 text-center flex-grow flex flex-col items-center border-b-2 transition-all ${day === activeDay ? 'border-b-2' : 'border-transparent'}`}
                          style={{ 
                            borderBottomColor: day === activeDay ? '#347486' : 'transparent',
                            backgroundColor: day === activeDay ? '#f0f9fb' : 'white'
                          }}
                        >
                          <span className="font-medium">{day}</span>
                          <div 
                            className={`text-xs mt-1 px-2 py-0.5 rounded-full ${count > 0 ? 'text-white' : 'text-gray-400 bg-gray-100'}`}
                            style={{ backgroundColor: count > 0 ? '#DFA55D' : '' }}
                          >
                            {count} sessions
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sessions for selected day - Enhanced UI */}
                {getSessionsForDay(activeDay).length === 0 ? (
                  <div className="text-center py-16 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    <div className="text-5xl mb-2">📅</div>
                    <h4 className="text-lg font-medium mb-2">No sessions for {activeDay}</h4>
                    <p className="text-sm text-gray-500">Add your first training session using the form</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getSessionsForDay(activeDay).map((session, sessionIdx) => {
                      const dayIndex = formData.schedule.findIndex(d => d.day === activeDay);
                      return (
                        <div 
                          key={sessionIdx}
                          className="p-4 rounded-lg border border-gray-200 bg-white flex justify-between items-start shadow-sm hover:shadow transition-shadow"
                          style={{ borderLeft: '4px solid #DFA55D' }}
                        >
                          <div className="flex items-start gap-5">
                            <div className="text-center p-2 rounded-lg bg-gray-50" style={{ minWidth: '80px' }}>
                              <div className="font-bold text-lg" style={{ color: '#347486' }}>
                                {session.time.split(' ')[0]}
                              </div>
                              <div className="text-xs font-medium text-gray-500">{session.time.split(' ')[1]}</div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-800 text-lg">{session.training_type}</h4>
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <span className="inline-block px-2 py-1 bg-gray-100 rounded-full mr-2">
                                  {session.duration}
                                </span>
                                {session.status && (
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    {session.status}
                                  </span>
                                )}
                              </div>
                              {session.notes && (
                                <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded">{session.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveSession(dayIndex, sessionIdx)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1 hover:bg-red-50 rounded-full"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Weekly overview - Enhanced UI */}
                {getTotalSessions() > 0 && (
                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-medium mb-3" style={{ color: '#347486' }}>Weekly Schedule Overview</h4>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {daysOfWeek.map((day) => {
                        const count = getSessionCount(day);
                        return (
                          <div key={day} 
                            className={`flex flex-col items-center p-2 rounded-lg ${day === activeDay ? 'bg-blue-50' : ''}`}>
                            <div className="text-sm font-medium mb-1">{day.substring(0, 3)}</div>
                            <div 
                              className={`w-8 h-8 flex items-center justify-center rounded-full ${count > 0 ? 'text-white' : 'text-gray-400 bg-gray-100'}`}
                              style={{ backgroundColor: count > 0 ? '#DFA55D' : '' }}
                            >
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateTrainingScheduleForm;