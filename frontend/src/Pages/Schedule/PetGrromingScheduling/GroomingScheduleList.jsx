import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GroomingScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem('token');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/scheduling/groomingschedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSchedules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load schedules");
      console.error("Schedule fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this schedule?");
    if (!confirm) return;

    try {
      setDeletingId(id);
      await axios.delete(`${backendUrl}/api/scheduling/groomingschedule/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Schedule deleted successfully");
      setSchedules(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      toast.error("Failed to delete schedule");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/update-groomingschedule/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Determine schedule status
  const getScheduleStatus = (schedule) => {
    const now = new Date();
    const startTime = new Date(schedule?.start_time);
    
    if (schedule?.appointment_id?.status === "cancelled") {
      return "cancelled";
    } else if (now > startTime) {
      return "completed";
    } else if (schedule?.appointment_id?.status === "confirmed") {
      return "upcoming";
    } else {
      return "pending";
    }
  };
  
  // Get status display properties
  const getStatusDisplay = (status) => {
    switch(status) {
      case "upcoming":
        return { 
          label: "Upcoming", 
          bgColor: "bg-green-500", 
          textBg: "bg-green-100", 
          textColor: "text-green-800" 
        };
      case "completed":
        return { 
          label: "Completed", 
          bgColor: "bg-teal-500", 
          textBg: "bg-teal-100", 
          textColor: "text-teal-800" 
        };
      case "cancelled":
        return { 
          label: "Cancelled", 
          bgColor: "bg-red-500", 
          textBg: "bg-red-100", 
          textColor: "text-red-800" 
        };
      case "pending":
      default:
        return { 
          label: "Pending", 
          bgColor: "bg-amber-500", 
          textBg: "bg-amber-100", 
          textColor: "text-amber-800" 
        };
    }
  };

  // Filter schedules based on status
  const filteredSchedules = filterStatus === 'all' 
    ? schedules 
    : schedules.filter(item => {
        const scheduleStatus = getScheduleStatus(item);
        return scheduleStatus === filterStatus;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-4 border-t-teal-600 border-teal-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-teal-700 font-medium">Loading grooming schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-xl px-8 py-6 mb-8 shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Grooming Schedules</h1>
            <p className="text-teal-100 mt-1">Manage your pet grooming appointments</p>
          </div>
          <button 
            onClick={() => navigate('/AppointmentLIST')}
            className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Schedule
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8 flex flex-wrap items-center justify-between">
          <div className="text-lg font-medium text-gray-700 mb-3 sm:mb-0">
            {filteredSchedules.length} {filteredSchedules.length === 1 ? 'Schedule' : 'Schedules'} Found
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md transition-all ${
                filterStatus === 'all' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus('upcoming')}
              className={`px-4 py-2 rounded-md transition-all ${
                filterStatus === 'upcoming' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-md transition-all ${
                filterStatus === 'pending' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-md transition-all ${
                filterStatus === 'completed' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button 
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-md transition-all ${
                filterStatus === 'cancelled' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {!filteredSchedules.length ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No grooming schedules found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus !== 'all' 
                ? `No schedules with '${filterStatus}' status.` 
                : 'Create your first grooming schedule to get started!'}
            </p>
            <button 
              onClick={() => navigate('/AppointmentLIST')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchedules.map((item) => {
              const scheduleStatus = getScheduleStatus(item);
              const statusDisplay = getStatusDisplay(scheduleStatus);
              
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Status Bar */}
                  <div className={`h-2 ${statusDisplay.bgColor}`}></div>
                  
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {item?.service_id?.service_name || 'Grooming Service'}
                        </h3>
                        <div className="text-sm font-medium text-teal-700 mt-1">
                          {formatDate(item?.appointment_id?.appointment_date)} • {formatTime(item?.start_time)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${statusDisplay.textBg} ${statusDisplay.textColor}`}
                      >
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Pet</div>
                        <div className="font-medium text-gray-800">
                          {item?.pet_id?.name || 'N/A'} ({item?.pet_id?.species || 'N/A'})
                        </div>
                        <div className="text-sm text-gray-600">{item?.pet_id?.breed || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-medium text-gray-800">{item?.Period || 'N/A'}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-500">Time</div>
                        <div className="font-medium text-gray-800">
                          {formatTime(item?.start_time)} 
                          {item?.end_time && ` - ${formatTime(item?.end_time)}`}
                        </div>
                      </div>
                    </div>
                    
                    {(item.special_requests || item.notes) && (
                      <div className="mt-4 text-sm">
                        {item.special_requests && (
                          <div className="mb-3">
                            <div className="font-medium text-teal-700">Special Requests:</div>
                            <p className="text-gray-700 mt-1">{item.special_requests}</p>
                          </div>
                        )}
                        
                        {item.notes && (
                          <div>
                            <div className="font-medium text-teal-700">Notes:</div>
                            <p className="text-gray-700 mt-1">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleUpdate(item._id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {deletingId === item._id ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
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

export default GroomingScheduleList;