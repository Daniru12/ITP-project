import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = "http://localhost:3000"; // Change if needed

const UpdateGroomingSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  const token = localStorage.getItem("token");

  // Helper to get the current local datetime in 'YYYY-MM-DDTHH:mm' format
  const getLocalDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/scheduling/groomingschedule/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("🧾 Grooming Schedule:", res.data);
        setSchedule(res.data.data);
      } catch (error) {
        toast.error("Failed to fetch grooming schedule");
        console.error("Error fetching grooming schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id, token]);

  const handleChange = (field, value) => {
    setFormChanged(true);
    setSchedule((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put(
        `${backendUrl}/api/scheduling/groomingschedule/update/${id}`,
        schedule,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Grooming schedule updated successfully!");
      setFormChanged(false);
      setTimeout(() => navigate("/schedule/grooming"), 2000);
    } catch (error) {
      toast.error("Error updating grooming schedule");
      console.error("Error updating grooming schedule:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Ask for confirmation before leaving if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formChanged]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="animate-pulse text-center p-8 bg-white rounded-lg shadow-md">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-red-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 font-medium">Loading grooming schedule...</p>
        </div>
      </div>
    );
  }
  
  if (!schedule) {
    return (
      <div className="p-12 text-red-700 text-center bg-white rounded-lg shadow-md max-w-2xl mx-auto my-12">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="font-bold text-xl mb-2">Failed to load schedule</h3>
        <p className="mb-6 text-amber-800">We couldn't find the grooming schedule you're looking for.</p>
        <button 
          onClick={() => navigate("/schedule/grooming")}
          className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition duration-300 shadow-md"
        >
          Back to Schedules
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#347486] text-white p-6">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Update Grooming Schedule</h2>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                schedule.status === 'Completed' ? 'bg-green-500' : 
                schedule.status === 'Cancelled' ? 'bg-gray-500' : 'bg-amber-500'
              }`}>
                {schedule.status || 'Scheduled'}
              </span>
            </div>
          </div>
          {schedule.start_time && (
            <p className="text-amber-200 mt-2">
              Scheduled for: {formatDate(schedule.start_time)}
            </p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Left panel */}
          <div className="md:w-1/3 bg-amber-100 p-6">
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-red-800 border-b border-amber-300 pb-2 mb-4">
                Schedule Information
              </h3>
              <p className="text-amber-900 mb-1"><span className="font-medium">ID:</span> #{id}</p>
              {schedule.Period && (
                <p className="text-amber-900 mb-1"><span className="font-medium">Period:</span> {schedule.Period}</p>
              )}
              {schedule.status && (
                <p className="text-amber-900 mb-1"><span className="font-medium">Status:</span> {schedule.status}</p>
              )}
              {schedule.start_time && (
                <p className="text-amber-900"><span className="font-medium">Date:</span> {formatDate(schedule.start_time)}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-800 border-b border-amber-300 pb-2 mb-4">
                Tips
              </h3>
              <ul className="space-y-2 text-amber-900">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>Use specific time slots for better scheduling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>Include all special requests in detail</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <span>Notes are visible to all staff members</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right panel - Form */}
          <div className="md:w-2/3 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block font-medium text-sm text-amber-900 mb-1">Period</label>
                  <input
                    type="text"
                    value={schedule.Period || ""}
                    onChange={(e) => handleChange("Period", e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-amber-50/50"
                    placeholder="e.g. Weekly, Monthly"
                  />
                </div>

                <div>
                  <label className="block font-medium text-sm text-amber-900 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={schedule.start_time ? new Date(schedule.start_time).toISOString().slice(0, 16) : ""}
                    min={getLocalDatetime()} 
                    onChange={(e) => handleChange("start_time", e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-amber-50/50"
                  />
                </div>
              
                <div>
                  <label className="block font-medium text-sm text-amber-900 mb-1">Status</label>
                  <select
                    value={schedule.status || ""}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-amber-50/50"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-sm text-amber-900 mb-1">Special Requests</label>
                  <input
                    type="text"
                    value={schedule.special_requests || ""}
                    onChange={(e) => handleChange("special_requests", e.target.value)}
                    className="w-full border border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-amber-50/50"
                    placeholder="Any special requests for this appointment"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm text-amber-900 mb-1">Notes</label>
                <textarea
                  value={schedule.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="w-full border border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-amber-50/50 min-h-32"
                  placeholder="Additional notes for this grooming session"
                />
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-amber-200">
                <div>
                  {formChanged && (
                    <span className="text-amber-600 text-sm">
                      You have unsaved changes
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/schedule/grooming")}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-[#BC4626] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A03F1F] transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-[#BC4626] shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}

                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : 'Update Schedule'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
};

export default UpdateGroomingSchedule;