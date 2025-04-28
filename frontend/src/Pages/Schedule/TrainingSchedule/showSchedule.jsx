import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MyTrainingSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [formData, setFormData] = useState({
    time: '',
    training_type: '',
    duration: '',
    status: '',
    notes: '',
  });

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!token) return;

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = decodedToken.userId || decodedToken.id;
        setUserId(currentUserId);

        const res = await axios.get(`${backendUrl}/api/scheduling/trainingschedule`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const all = res.data.data;
        const mySchedules = all.filter(
          (schedule) => schedule.appointment_id?.provider_id === currentUserId
        );
        setSchedules(mySchedules);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Failed to load your training schedules');
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Handle session deletion
  const handleDelete = async (scheduleId, day, sessionIndex) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const confirm = window.confirm('Are you sure you want to delete this session?');
      if (!confirm) return;

      await axios.delete(`${backendUrl}/api/scheduling/trainingschedule/delete/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { day, sessionIndex },
      });

      setSchedules((prev) =>
        prev.map((s) => {
          if (s._id === scheduleId) {
            const updatedSchedule = s.schedule.map((d) => {
              if (d.day === day) {
                const newSessions = [...d.sessions];
                newSessions.splice(sessionIndex, 1);
                return { ...d, sessions: newSessions };
              }
              return d;
            });
            return { ...s, schedule: updatedSchedule };
          }
          return s;
        })
      );

      toast.success('Session deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session');
    }
  };

  // Open edit modal and populate form data
  const handleEditClick = (scheduleId, day, session, sessionIndex) => {
    setEditingSession({ scheduleId, day, sessionIndex });
    setFormData(session);
    setIsEditOpen(true);
  };

  // Save edited session data
  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { scheduleId, day, sessionIndex } = editingSession;

      await axios.put(
        `${backendUrl}/api/scheduling/trainingschedule/update/${scheduleId}`,
        {
          day,
          sessionIndex,
          sessionData: formData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSchedules((prev) =>
        prev.map((s) => {
          if (s._id === scheduleId) {
            const updated = s.schedule.map((d) => {
              if (d.day === day) {
                const newSessions = [...d.sessions];
                newSessions[sessionIndex] = { ...formData };
                return { ...d, sessions: newSessions };
              }
              return d;
            });
            return { ...s, schedule: updated };
          }
          return s;
        })
      );

      toast.success('Session updated successfully');
      setIsEditOpen(false);
      setEditingSession(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update session');
    }
  };


  // Organize sessions by day
  const getSessionsByDay = () => {
    const dayMap = {};
    daysOfWeek.forEach((day) => (dayMap[day] = []));
    schedules.forEach((s) => {
      s.schedule.forEach((dayObj) => {
        if (dayMap[dayObj.day]) {
          dayMap[dayObj.day].push(
            ...dayObj.sessions.map((session, i) => ({
              ...session,
              scheduleId: s._id,
              day: dayObj.day,
              sessionIndex: i,
              pet: s.pet_id?.name,
            }))
          );
        }
      });
    });
    return dayMap;
  };

  // Determine status badge color
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get training type icon
  const getTrainingIcon = (type) => {
    if (!type) return '🐾';
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('obedience')) return '🦮';
    if (normalizedType.includes('agility')) return '🏃‍♂️';
    if (normalizedType.includes('behavior')) return '🧠';
    if (normalizedType.includes('trick')) return '🎪';
    return '🐾';
  };

  const sessionsByDay = getSessionsByDay();

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#347486] mb-2">Training Calendar</h2>
        <p className="text-gray-600">Manage your pet training sessions</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#DFA55D] border-t-[#347486] rounded-full animate-spin mb-4"></div>
          <p className="text-[#347486] font-medium">Loading your schedule...</p>
        </div>
      ) : (
        <div className="mb-8">
          {/* Day selector tabs */}
          <div className="flex overflow-x-auto mb-6 scrollbar-hide">
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
                    activeDay === day
                      ? 'bg-[#347486] text-white shadow-md'
                      : 'hover:bg-[#DFA55D]/20 text-gray-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Active day content */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#347486]">{activeDay}</h3>
              <span className="px-3 py-1 text-sm bg-[#DFA55D]/10 text-[#DFA55D] rounded-full">
                {sessionsByDay[activeDay].length} sessions
              </span>
            </div>

            {sessionsByDay[activeDay].length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sessionsByDay[activeDay].map((session, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-md p-5 border-l-4 border-[#DFA55D] hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">{getTrainingIcon(session.training_type)}</span>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-bold text-gray-800 text-lg">{session.training_type || 'Training Session'}</h4>
                            <span
                              className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${getStatusClass(session.status)}`}
                            >
                              {session.status || 'Scheduled'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Time:</span> {session.time}
                            <span className="mx-2">•</span>
                            <span className="font-medium">Duration:</span> {session.duration}
                          </p>
                          <p className="text-[#347486] text-sm font-medium mt-1">
                            Pet: {session.pet || 'Unknown pet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleEditClick(session.scheduleId, session.day, session, session.sessionIndex)
                          }
                          className="p-2 text-[#347486] hover:bg-[#347486]/10 rounded-full transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(session.scheduleId, session.day, session.sessionIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {session.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <div className="text-4xl mb-3">🐾</div>
                <p className="text-gray-500">No training sessions scheduled for {activeDay}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="fixed z-50 inset-0">
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4" aria-hidden="true" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50 relative border-t-4 border-[#DFA55D]">
            <Dialog.Title className="text-2xl font-bold text-[#347486] mb-4">
              Edit Training Session
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-[#347486] outline-none transition-all"
                  placeholder="e.g., 10:00 AM"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-[#347486] outline-none transition-all"
                  placeholder="e.g., Obedience"
                  value={formData.training_type}
                  onChange={(e) => setFormData({ ...formData, training_type: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-[#347486] outline-none transition-all"
                  placeholder="e.g., 30 minutes"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-[#347486] outline-none transition-all appearance-none bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23347486'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '3rem',
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-[#347486] outline-none transition-all min-h-24"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
              <button
                className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium text-gray-700"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-[#347486] text-white rounded-lg hover:bg-[#347486]/90 transition-colors font-medium"
                onClick={handleEditSave}
              >
                Save Changes
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MyTrainingSchedules;