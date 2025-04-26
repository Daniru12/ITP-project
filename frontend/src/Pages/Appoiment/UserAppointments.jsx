import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { FaCalendarCheck, FaFileInvoiceDollar, FaPencilAlt, FaTrashAlt, FaSearch, FaFilter } from "react-icons/fa";
import { MdPets, MdEventNote, MdPayment } from "react-icons/md";

import HamsterLoader from "../../components/HamsterLoader";

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [boardingSchedules, setBoardingSchedules] = useState([]);
  const [groomingSchedules, setGroomingSchedules] = useState([]);
  const [trainingSchedules, setTrainingSchedules] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) {
        toast.error("You're not logged in.");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.get(`${backendUrl}/api/appointments/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
        setAppointments(data);
      } catch (err) {
        toast.error("Failed to load appointments");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSchedules = async () => {
      try {
        const [boardingRes, groomingRes, trainingRes] = await Promise.all([
          axios.get(`${backendUrl}/api/scheduling/bordingschedule`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/scheduling/groomingschedule`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/scheduling/trainingschedule`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBoardingSchedules(Array.isArray(boardingRes.data) ? boardingRes.data : []);
        setGroomingSchedules(Array.isArray(groomingRes.data) ? groomingRes.data : []);
        setTrainingSchedules(Array.isArray(trainingRes.data.data) ? trainingRes.data.data : []);
      } catch (err) {
        toast.error("Failed to load schedules");
        setBoardingSchedules([]);
        setGroomingSchedules([]);
        setTrainingSchedules([]);
      }
    };

    fetchAppointments();
    fetchSchedules();
  }, [backendUrl, token]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await axios.delete(`${backendUrl}/api/appointments/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Appointment deleted successfully");
      setAppointments((prev) => prev.filter((appt) => appt._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete appointment");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = (id) => {
    navigate(`/appointments/update/${id}`);
  };

  const handleScheduleDetails = (appointmentId) => {
    const boardingMatch = boardingSchedules.find((s) => s.appointment_id?._id === appointmentId);
    const groomingMatch = groomingSchedules.find((s) => s.appointment_id?._id === appointmentId);
    const trainingMatch = trainingSchedules.find((s) => s.appointment_id?._id === appointmentId);

    if (boardingMatch) setSelectedSchedule({ ...boardingMatch, type: "Boarding" });
    else if (groomingMatch) setSelectedSchedule({ ...groomingMatch, type: "Grooming" });
    else if (trainingMatch) setSelectedSchedule({ ...trainingMatch, type: "Training" });
    else toast("No schedule found for this appointment");
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "✓";
      case "cancelled":
        return "✕";
      case "completed":
        return "✓✓";
      case "pending":
      default:
        return "⧖";
    }
  };

  const getServiceIcon = (serviceName) => {
    if (!serviceName) return <MdPets className="text-gray-500" />;
    
    const service = serviceName.toLowerCase();
    if (service.includes("board")) return <MdEventNote className="text-amber-500" />;
    if (service.includes("groom")) return <MdPets className="text-teal-500" />;
    if (service.includes("train")) return <MdPets className="text-red-500" />;
    return <MdPets className="text-gray-500" />;
  };

  const filteredAppointments = appointments.filter((appt) => {
    // Apply status filter
    if (filterStatus !== "all" && appt.status?.toLowerCase() !== filterStatus) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesService = appt.service_id?.service_name?.toLowerCase().includes(searchLower);
      const matchesPet = appt.pet_id?.name?.toLowerCase().includes(searchLower);
      const matchesPackage = appt.package_type?.toLowerCase().includes(searchLower);
      
      return matchesService || matchesPet || matchesPackage;
    }
    
    return true;
  });

  const serviceCounts = appointments.reduce((acc, appt) => {
    const service = appt.service_id?.service_name || "Unknown";
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return <HamsterLoader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero section with custom terracotta color */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white py-8 px-6 shadow-lg" style={{ background: "linear-gradient(to right, #e67e22, #34495e)" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2"> My Pet Appointments</h2>
          <p className="text-red-100">Manage your pet service bookings in one place</p>
          
          {appointments.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6">
              {Object.entries(serviceCounts).map(([service, count]) => (
                <div key={service} className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg">
                  <span className="text-sm font-medium">{service}</span>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Filters and search */}
        {appointments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaFilter className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                style={{ borderColor: "#DFA55D", outlineColor: "#BC4626" }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-red-500"
                style={{ borderColor: "#DFA55D", outlineColor: "#BC4626" }}
              />
            </div>

            <Link
              to="/appointments/create"
              className="text-white py-2 px-6 rounded-md transition duration-150 w-full md:w-auto text-center"
              style={{ backgroundColor: "#BC4626" }}
            >
              Book New Appointment
            </Link>
          </div>
        )}

        {/* Empty state */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" 
                 style={{ backgroundColor: "rgba(223, 165, 93, 0.2)" }}>
              <MdPets style={{ color: "#BC4626" }} className="text-4xl" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Appointments Yet</h3>
            <p className="text-gray-600 mb-6">You haven't booked any pet appointments yet.</p>
            <Link
              to="/appointments/create"
              className="text-white py-3 px-8 rounded-md transition duration-150 inline-block"
              style={{ backgroundColor: "#BC4626" }}
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching appointments</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appt) => {
              const hasBoardingSchedule = boardingSchedules.find((s) => s.appointment_id?._id === appt._id);
              const hasGroomingSchedule = groomingSchedules.find((s) => s.appointment_id?._id === appt._id);
              const hasTrainingSchedule = trainingSchedules.find((s) => s.appointment_id?._id === appt._id);
              const hasSchedule = hasBoardingSchedule || hasGroomingSchedule || hasTrainingSchedule;

              return (
                <div
                  key={appt._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden relative"
                >
                  {/* Status indicator */}
                  <div className="absolute top-0 right-0 m-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        appt.status
                      )}`}
                    >
                      {getStatusIcon(appt.status)} {appt.status || "Unknown"}
                    </span>
                  </div>

                  {/* Card header */}
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: "rgba(223, 165, 93, 0.2)" }}>
                      {getServiceIcon(appt.service_id?.service_name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {appt.service_id?.service_name || "Unknown Service"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Pet: {appt.pet_id?.name || "Unknown Pet"}
                      </p>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-4">
                    <div className="space-y-3 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          📅
                        </span>
                        <span className="text-gray-700">
                          {new Date(appt.appointment_date).toLocaleDateString()} at{" "}
                          {new Date(appt.appointment_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>

                      <p className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          📦
                        </span>
                        <span className="text-gray-700">{appt.package_type || "Standard Package"}</span>
                      </p>

                      {appt.discount_applied > 0 && (
                        <p className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                style={{ backgroundColor: "rgba(52, 116, 134, 0.1)", color: "#347486" }}>
                            %
                          </span>
                          <span style={{ color: "#347486" }} className="font-medium">{appt.discount_applied}% Discount Applied</span>
                        </p>
                      )}

                      {appt.special_notes && (
                        <div className="mt-3 p-3 rounded-md" style={{ backgroundColor: "rgba(223, 165, 93, 0.1)" }}>
                          <p className="text-xs font-medium mb-1" style={{ color: "#BC4626" }}>Special Notes:</p>
                          <p className="text-sm text-gray-700">{appt.special_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {appt.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdate(appt._id)}
                            className="flex-1 flex items-center justify-center gap-1 text-white py-2 px-3 rounded-md text-sm transition"
                            style={{ backgroundColor: "#DFA55D" }}
                          >
                            <FaPencilAlt className="text-xs" /> Update
                          </button>
                          <button
                            onClick={() => handleDelete(appt._id)}
                            disabled={deletingId === appt._id}
                            className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md text-sm transition disabled:opacity-50"
                          >
                            <FaTrashAlt className="text-xs" /> {deletingId === appt._id ? "Deleting..." : "Cancel"}
                          </button>
                        </>
                      )}

                      {appt.status === "confirmed" && (
                        <Link
                          to={`/payment/${appt._id}`}
                          className="flex-1 flex items-center justify-center gap-1 text-white py-2 px-3 rounded-md text-sm transition"
                          style={{ backgroundColor: "#347486" }}
                        >
                          <MdPayment /> Make Payment
                        </Link>
                      )}

                      {appt.status === "cancelled" && (
                        <button
                          onClick={() => handleDelete(appt._id)}
                          disabled={deletingId === appt._id}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm transition disabled:opacity-50"
                        >
                          <FaTrashAlt className="text-xs" /> {deletingId === appt._id ? "Deleting..." : "Delete"}
                        </button>
                      )}

                      {appt.status === "confirmed" && hasSchedule && (
                        <button
                          onClick={() => handleScheduleDetails(appt._id)}
                          className="flex-1 flex items-center justify-center gap-1 text-white py-2 px-3 rounded-md text-sm transition"
                          style={{ backgroundColor: "#BC4626" }}
                        >
                          <FaCalendarCheck /> View Schedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2 rounded-full" style={{ backgroundColor: "rgba(223, 165, 93, 0.1)" }}>
                <FaCalendarCheck style={{ color: "#BC4626" }} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {selectedSchedule.type} Schedule Details
              </h3>
            </div>

            {selectedSchedule.type === "Training" ? (
              <>
                <div className="flex items-center gap-2 mb-4" style={{ color: "#BC4626" }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: "rgba(188, 70, 38, 0.1)" }}>
                    📅
                  </span>
                  <span className="font-medium">
                    Week Starting: {new Date(selectedSchedule.week_start_date).toLocaleDateString()}
                  </span>
                </div>

                {selectedSchedule.schedule?.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {selectedSchedule.schedule.map((dayObj, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold border-b border-gray-200 pb-1 mb-2" style={{ color: "#BC4626" }}>
                          {dayObj.day}
                        </p>
                        {(dayObj.sessions || []).length > 0 ? (
                          <div className="space-y-3">
                            {(dayObj.sessions || []).map((s, i) => (
                              <div key={i} className="bg-white rounded-md p-3 border border-gray-100">
                                <p className="text-sm font-medium text-gray-700">
                                  {s.time || "N/A"} • {s.training_type || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Duration: {s.duration || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                      s.status?.toLowerCase() === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : s.status?.toLowerCase() === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {s.status || "Scheduled"}
                                  </span>
                                </p>
                                {s.notes?.trim() && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    <span className="font-medium">Notes:</span> {s.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No sessions scheduled</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">No sessions available.</p>
                )}

                {selectedSchedule.comments?.trim() && (
                  <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: "rgba(223, 165, 93, 0.1)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#BC4626" }}>Trainer Comments:</p>
                    <p className="text-sm text-gray-700">{selectedSchedule.comments}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedSchedule.start_time && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs font-medium text-gray-500">Start Time</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(selectedSchedule.start_time).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  )}

                  {selectedSchedule.end_time && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs font-medium text-gray-500">End Time</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(selectedSchedule.end_time).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {selectedSchedule.status && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedSchedule.status.toLowerCase() === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : selectedSchedule.status.toLowerCase() === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedSchedule.status}
                    </span>
                  </div>
                )}

                {selectedSchedule.confirmed_days?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Confirmed Days</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSchedule.confirmed_days.map((day, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-md text-xs font-medium"
                          style={{ backgroundColor: "rgba(52, 116, 134, 0.1)", color: "#347486" }}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSchedule.notes && (
                  <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: "rgba(223, 165, 93, 0.1)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#BC4626" }}>Staff Notes:</p>
                    <p className="text-sm text-gray-700">{selectedSchedule.notes}</p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setSelectedSchedule(null)}
              className="mt-6 w-full text-white py-2 rounded-md transition flex items-center justify-center gap-1"
              style={{ backgroundColor: "#BC4626" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAppointments;