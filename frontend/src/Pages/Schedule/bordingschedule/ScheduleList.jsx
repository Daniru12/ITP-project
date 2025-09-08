import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaTrash, FaEdit, FaCheckCircle, FaPaw, FaUser, FaPhone, FaCalendarAlt, 
         FaHourglassHalf, FaSearch, FaFilter, FaPlus, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { format, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';

const BoardingScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmedDays, setConfirmedDays] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schedules, searchTerm, startDate, endDate, statusFilter, sortDirection]);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await axios.get(`${backendUrl}/api/scheduling/bordingschedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules(res.data || []);

      const dayMap = {};
      (res.data || []).forEach(s => {
        dayMap[s._id] = s.confirmed_days || [];
      });
      setConfirmedDays(dayMap);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load schedules", error);
      toast.error("Could not load schedules");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...schedules];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(schedule => {
        const petName = (schedule.pet_id?.name || '').toLowerCase();
        const ownerName = (schedule.pet_id?.owner_id?.full_name || '').toLowerCase();
        const ownerPhone = (schedule.pet_id?.owner_id?.phone_number || '').toLowerCase();
        
        return petName.includes(term) || 
               ownerName.includes(term) || 
               ownerPhone.includes(term);
      });
    }

    // Apply date range filter
    if (startDate && endDate) {
      results = results.filter(schedule => {
        const scheduleStart = new Date(schedule.start_time);
        const scheduleEnd = new Date(schedule.end_time);
        const filterStart = parseISO(startDate);
        const filterEnd = parseISO(endDate);

        // Check if there's any overlap between the schedule and the filter range
        return (
          (scheduleStart <= filterEnd && scheduleEnd >= filterStart) || 
          isWithinInterval(scheduleStart, { start: filterStart, end: filterEnd }) ||
          isWithinInterval(scheduleEnd, { start: filterStart, end: filterEnd })
        );
      });
    } else if (startDate) {
      const filterStart = parseISO(startDate);
      results = results.filter(schedule => new Date(schedule.end_time) >= filterStart);
    } else if (endDate) {
      const filterEnd = parseISO(endDate);
      results = results.filter(schedule => new Date(schedule.start_time) <= filterEnd);
    }

    // Apply status filter
    if (statusFilter) {
      results = results.filter(schedule => schedule.status === statusFilter);
    }

    // Apply sorting
    results.sort((a, b) => {
      const dateA = new Date(a.start_time);
      const dateB = new Date(b.start_time);
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredSchedules(results);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this schedule?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.delete(`${backendUrl}/api/scheduling/bordingschedule/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Schedule deleted successfully");
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
      // Update status only, avoid sending unnecessary fields
      const response = await axios.put(`${backendUrl}/api/scheduling/bordingschedule/update/${id}`,
        { status: "Completed" },  // Just update status
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        toast.success("Schedule marked as completed");
        fetchSchedules(); // Refresh the schedule list after the update
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error in handleMarkComplete:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };
  

  const toggleDayConfirm = async (scheduleId, dateStr) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const res = await axios.patch(
        `${backendUrl}/api/scheduling/bordingschedule/toggle/${scheduleId}`,
        { date: dateStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmedDays(prev => ({
        ...prev,
        [scheduleId]: res.data.confirmed_days,
      }));
      
      toast.success("Day status updated");
    } catch (error) {
      toast.error("Failed to update day");
    }
  };

  const handleEdit = (scheduleId) => {
    navigate(`/scheduling/boarding/${scheduleId}`);
  };

  const handleAddNew = () => {
    navigate('/AppointmentLIST');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-[#DFA55D] text-white';
      case 'In Progress':
        return 'bg-[#347486] text-white';
      case 'Completed':
        return 'bg-green-600 text-white';
      case 'Canceled':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <FaCalendarAlt className="mr-1" />;
      case 'In Progress':
        return <FaHourglassHalf className="mr-1" />;
      case 'Completed':
        return <FaCheckCircle className="mr-1" />;
      case 'Canceled':
        return <FaTrash className="mr-1" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-[#BC4626] border-b-[#DFA55D] border-l-[#347486] border-r-[#347486] rounded-full animate-spin"></div>
          <p className="text-[#BC4626] text-lg mt-4 font-medium">Loading boarding schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center text-[#BC4626]">Pet Boarding Schedules</h2>
        <div className="w-24 h-1 bg-[#DFA55D] mx-auto mt-3"></div>
      </div>

      {/* Controls section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
       {/* Search */}
{/* Search */}
<div className="relative flex-1">
<label className="block text-xs font-medium text-gray-700 mb-1">Search</label>

  <input
    type="text"
    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-[#347486]"
    placeholder="Search pet or owner..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>




          {/* Date range filter */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-[#347486]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-[#347486]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-[#347486]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex space-x-2 mb-2 sm:mb-0">
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#347486]"
            >
              <FaFilter className="mr-2" /> Reset Filters
            </button>
            <button
              onClick={toggleSortDirection}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#347486]"
            >
              {sortDirection === 'desc' ? (
                <FaSortAmountDown className="mr-2" />
              ) : (
                <FaSortAmountUp className="mr-2" />
              )}
              Sort: {sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
          <div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC4626] hover:bg-[#a03a20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC4626]"
            >
              <FaPlus className="mr-2" /> Add New Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-gray-600">
        <p>
          {filteredSchedules.length === 0 
            ? "No schedules found" 
            : `Showing ${filteredSchedules.length} of ${schedules.length} schedules`}
        </p>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <FaPaw className="text-[#DFA55D] text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No matching schedules found.</p>
          <p className="text-gray-500 mt-2">
            {schedules.length > 0 
              ? "Try adjusting your search criteria or filters."
              : "Click the add button to create a new boarding schedule."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => {
            const pet = schedule.pet_id || {};
            const owner = pet.owner_id || {};

            const daysBetween = eachDayOfInterval({
              start: new Date(schedule.start_time),
              end: new Date(schedule.end_time),
            });

            return (
              <div
                key={schedule._id}
                className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaPaw className="text-[#BC4626] mr-2" />
                      <h3 className="text-xl font-semibold text-gray-800">{pet.name || 'Unknown Pet'}</h3>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center ${getStatusColor(schedule.status)}`}>
                      {getStatusIcon(schedule.status)}
                      {schedule.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <FaUser className="text-[#347486] mr-2" />
                    <p>{owner.full_name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaPhone className="text-[#347486] mr-2" />
                    <p>{owner.phone_number || 'N/A'}</p>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-[#BC4626] mb-2">
                      <FaClock className="mr-2" />
                      <p className="font-medium">Schedule Details</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Start: {new Date(schedule.start_time).toLocaleDateString()} {new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-700">
                      End: {new Date(schedule.end_time).toLocaleDateString()} {new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Duration:</span> {schedule.duration}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-[#347486] mb-2">Day Confirmation:</p>
                    <div className="flex flex-wrap gap-2">
                      {daysBetween.map((date) => {
                        const formatted = format(date, 'yyyy-MM-dd');
                        const dateShort = format(date, 'MM/dd');
                        const confirmed = confirmedDays[schedule._id]?.includes(formatted);
                        return (
                          <button
                            key={formatted}
                            onClick={() => toggleDayConfirm(schedule._id, formatted)}
                            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                              confirmed 
                                ? 'bg-[#347486] text-white border-[#347486]' 
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                            title={formatted}
                          >
                            <FaCheckCircle className={`text-xs ${confirmed ? 'text-white' : 'text-gray-400'}`} />
                            {dateShort}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 border-t border-gray-100">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleMarkComplete(schedule._id)}
                      disabled={updatingId === schedule._id || schedule.status === 'Completed'}
                      className={`text-white bg-green-600 p-2 rounded-md hover:bg-green-700 transition-colors ${
                        (updatingId === schedule._id || schedule.status === 'Completed') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Mark as Completed"
                    >
                      <FaCheckCircle className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleEdit(schedule._id)}
                      className="text-white bg-[#347486] p-2 rounded-md hover:bg-[#2a5f6c] transition-colors"
                      title="Edit Schedule"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="text-white bg-[#BC4626] p-2 rounded-md hover:bg-[#a13a20] transition-colors"
                      title="Delete Schedule"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoardingScheduleList;