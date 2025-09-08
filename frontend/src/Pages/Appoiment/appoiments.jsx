import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaCalendarPlus,
  FaTrash,
  FaSearch,
  FaFilter,
  FaFileExport,
  FaPrint,
  FaDownload,
  FaThumbsUp
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import HamsterLoader from '../../components/HamsterLoader';
import { FaPaw, FaBath, FaGraduationCap } from 'react-icons/fa'; // Add new icons

const AppointmentsList = () => {
  // Base states
  const [appointments, setAppointments] = useState([]);
  const [boardingSchedules, setBoardingSchedules] = useState([]);
  const [groomingSchedules, setGroomingSchedules] = useState([]);
  const [trainingSchedules, setTrainingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI states
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const [appointmentsRes, boardingRes, groomingRes, trainingRes] = await Promise.all([
          axios.get(`${backendUrl}/api/appointments/provider`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
        setAppointments(appointmentsRes.data.appointments || []);
        setBoardingSchedules(
          Array.isArray(boardingRes.data) ? boardingRes.data : boardingRes.data?.schedules || []
        );
        setGroomingSchedules(
          Array.isArray(groomingRes.data) ? groomingRes.data : groomingRes.data?.schedules || []
        );
        setTrainingSchedules(
          Array.isArray(trainingRes.data?.data) ? trainingRes.data.data : []
        );
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load data');
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const hasSchedule = (appointmentId, category) => {
    if (category === 'pet_boarding') {
      return boardingSchedules.some(s => s.appointment_id?._id === appointmentId);
    }
    if (category === 'pet_grooming') {
      return groomingSchedules.some(s => s.appointment_id?._id === appointmentId);
    }
    if (category === 'pet_training') {
      return trainingSchedules.some(s => s.appointment_id?._id === appointmentId);
    }
    return false;
  };

  const scheduleTabs = [
    {
      name: 'Boarding Schedule',
      path: '/schedule/boarding',
      icon: <FaPaw className="mr-3" />,
    },
    {
      name: 'Grooming Schedule',
      path: '/schedule/grooming',
      icon: <FaBath className="mr-3" />,
    },
    {
      name: 'Training Schedule',
      path: '/schedule/training',
      icon: <FaGraduationCap className="mr-3" />,
    },
  ];

  const handleConfirm = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.put(`${backendUrl}/api/appointments/${appointmentId}`, {
        status: 'confirmed',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Appointment confirmed!');
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: 'confirmed' } : a
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm appointment');
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.put(`${backendUrl}/api/appointments/${appointmentId}`, {
        status: 'completed',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Appointment marked as completed!');
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: 'completed' } : a
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.put(`${backendUrl}/api/appointments/${appointmentId}`, {
        status: 'cancelled',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Appointment cancelled!');
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: 'cancelled' } : a
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
  
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
      // Send delete request to backend
      await axios.delete(`${backendUrl}/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      toast.success('Appointment deleted!');
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));  // Update state
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };
  

  const handleSchedule = (appointment) => {
    const category = appointment?.service_id?.service_category;
    const routeMap = {
      pet_boarding: '/Bordingscheduleadd',
      pet_grooming: '/Groomingscheduleadd',
      pet_training: '/Trainingscheduleadd',
    };
    const path = routeMap[category];
    if (!path) {
      toast.error("Invalid service category");
      return;
    }
    navigate(path, {
      state: {
        appointmentId: appointment._id,
        appointmentDetails: appointment,
      },
    });
  };

  const handleViewSchedule = (appointment) => {
    const category = appointment?.service_id?.service_category;
    const routeMap = {
      pet_boarding: '/schedule/boarding',
      pet_grooming: '/schedule/grooming',
      pet_training: '/schedule/training',
    };
    const path = routeMap[category];
    if (!path) {
      toast.error("Invalid service category");
      return;
    }
    navigate(path, {
      state: {
        appointmentId: appointment._id,
        appointmentDetails: appointment,
      },
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'pet_boarding':
        return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'pet_grooming':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'pet_training':
        return 'bg-teal-100 text-teal-700 border border-teal-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'pet_boarding':
        return 'Boarding';
      case 'pet_grooming':
        return 'Grooming';
      case 'pet_training':
        return 'Training';
      default:
        return 'Other';
    }
  };

  // Filter and search logic with useMemo for performance
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // View mode filtering
      if (viewMode === 'active' && !['pending', 'confirmed'].includes(appointment.status)) return false;
      if (viewMode === 'archived' && !['completed', 'cancelled'].includes(appointment.status)) return false;

      const matchesSearch =
        (appointment.pet_id?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (appointment.pet_id?.owner_id?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (appointment.service_id?.service_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

      const category = appointment.service_id?.service_category;
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;

      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date().toDateString();
        const appointmentDate = new Date(appointment.appointment_date).toDateString();
        matchesDate = today === appointmentDate;
      } else if (dateFilter === 'upcoming') {
        const today = new Date();
        const appointmentDate = new Date(appointment.appointment_date);
        matchesDate = appointmentDate > today;
      } else if (dateFilter === 'past') {
        const today = new Date();
        const appointmentDate = new Date(appointment.appointment_date);
        matchesDate = appointmentDate < today;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [appointments, viewMode, searchTerm, statusFilter, categoryFilter, dateFilter]);

  // Sorting logic
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      let compareA, compareB;
      switch (sortBy) {
        case 'date':
          compareA = new Date(a.appointment_date);
          compareB = new Date(b.appointment_date);
          break;
        case 'pet':
          compareA = a.pet_id?.name?.toLowerCase() || '';
          compareB = b.pet_id?.name?.toLowerCase() || '';
          break;
        case 'owner':
          compareA = a.pet_id?.owner_id?.full_name?.toLowerCase() || '';
          compareB = b.pet_id?.owner_id?.full_name?.toLowerCase() || '';
          break;
        case 'status':
          compareA = a.status;
          compareB = b.status;
          break;
        case 'service':
          compareA = a.service_id?.service_name?.toLowerCase() || '';
          compareB = b.service_id?.service_name?.toLowerCase() || '';
          break;
        default:
          compareA = new Date(a.appointment_date);
          compareB = new Date(b.appointment_date);
      }
      // Handle the sort order
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }, [filteredAppointments, sortBy, sortOrder]);

  // Stats for dashboard
  const stats = useMemo(() => {
    const totalActive = appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const boarding = appointments.filter(a => a.service_id?.service_category === 'pet_boarding').length;
    const grooming = appointments.filter(a => a.service_id?.service_category === 'pet_grooming').length;
    const training = appointments.filter(a => a.service_id?.service_category === 'pet_training').length;
    return {
      totalActive, confirmed, pending, cancelled, completed,
      boarding, grooming, training
    };
  }, [appointments]);

  // Report generation function
  const generateReport = () => {
    // Filter data based on current filters
    const reportData = sortedAppointments.map(appointment => ({
      petName: appointment.pet_id?.name || 'N/A',
      ownerName: appointment.pet_id?.owner_id?.full_name || 'N/A',
      service: appointment.service_id?.service_name || 'N/A',
      category: getCategoryName(appointment.service_id?.service_category),
      status: appointment.status,
      date: new Date(appointment.appointment_date).toLocaleDateString(),
      package: appointment.package_type || 'Standard',
      discount: appointment.discount_applied || 0
    }));
    // Create CSV content
    let csvContent = "Pet Name,Owner Name,Service,Category,Status,Date,Package,Discount\n";
    reportData.forEach(item => {
      csvContent += `${item.petName},${item.ownerName},${item.service},${item.category},${item.status},${item.date},${item.package},${item.discount}%\n`;
    });
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'appointments_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Report downloaded successfully!');
  };

  // Print report function
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    // Create HTML content for printing
    let printContent = `
      <html>
        <head>
          <title>Appointments Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status-confirmed { background-color: #d1fae5; }
            .status-pending { background-color: #fef3c7; }
            .status-cancelled { background-color: #fee2e2; }
            .status-completed { background-color: #dbeafe; }
            .summary { margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Appointments Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Active Appointments: ${stats.totalActive}</p>
            <p>Confirmed: ${stats.confirmed} | Pending: ${stats.pending} | Cancelled: ${stats.cancelled} | Completed: ${stats.completed}</p>
            <p>Boarding: ${stats.boarding} | Grooming: ${stats.grooming} | Training: ${stats.training}</p>
          </div>
          <h2>Detailed Report</h2>
          <table>
            <thead>
              <tr>
                <th>Pet Name</th>
                <th>Owner</th>
                <th>Service</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Package</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
    `;
    sortedAppointments.forEach(appointment => {
      const service = appointment.service_id || {};
      const pet = appointment.pet_id || {};
      const owner = pet.owner_id || {};
      const category = service.service_category;
      printContent += `
        <tr class="status-${appointment.status}">
          <td>${pet.name || 'N/A'}</td>
          <td>${owner.full_name || 'N/A'}</td>
          <td>${service.service_name || 'N/A'}</td>
          <td>${getCategoryName(category)}</td>
          <td>${appointment.status}</td>
          <td>${new Date(appointment.appointment_date).toLocaleDateString()}</td>
          <td>${appointment.package_type || 'Standard'}</td>
          <td>.${appointment.discount_applied || 0}%</td>
        </tr>
      `;
    });
    printContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    // Wait for content to load then print
    printWindow.onload = function () {
      printWindow.print();
    };
  };

  if (loading) return <HamsterLoader />;
  if (error) return <div className="text-center text-red-600 mt-10 text-xl">{error}</div>;

  return (

    <div className="max-w-7xl mx-auto p-6">
      {/* Schedule Tabs */}
      
    <div className="max-w-7xl mx-auto p-6">
      
      {/* Header with title and stats */}
      <div className="bg-white rounded-xl shadow-md mb-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="mr-2"> </span>
            Appointments
          </h2>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={generateReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
            >
              <FaDownload className="mr-2" /> Export CSV
            </button>
            <button
              onClick={printReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
            >
              <FaPrint className="mr-2" /> Print Report
            </button>
          </div>
        </div>
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
            <p className="text-sm text-purple-600">Total Active</p>
            <p className="text-2xl font-bold text-purple-700">{stats.totalActive}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm">
            <p className="text-sm text-green-600">Confirmed</p>
            <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 shadow-sm">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 shadow-sm">
            <p className="text-sm text-red-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
        </div>
        {/* Search and Filter Bar */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/3">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by pet, owner or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-2/3">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {viewMode === 'active' ? (
                <>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'confirmed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Confirmed
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'completed' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setStatusFilter('cancelled')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Cancelled
                  </button>
                </>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center"
              >
                <FaFilter className="mr-1" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </button>
            </div>
          </div>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="pet_boarding">Boarding</option>
                  <option value="pet_grooming">Grooming</option>
                  <option value="pet_training">Training</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="pet">Pet Name</option>
                  <option value="owner">Owner Name</option>
                  <option value="status">Status</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          )}
          
        </div>
        <div className="bg-white rounded-xl shadow-md mb-6 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Schedule Management</h3>
        <div className="flex flex-wrap gap-2">
          {scheduleTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => navigate(tab.path)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === tab.path
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* View Mode Tabs */}
<div className="flex gap-4 mb-6">
  <button
    onClick={() => {
      setViewMode('active');
      setStatusFilter('all');
    }}
    className={`px-6 py-3 rounded-xl text-lg font-semibold transition-colors ${
      viewMode === 'active'
        ? 'bg-[var(--color-primary)] text-[var(--color-white)] shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    Active Appointments
  </button>
  <button
    onClick={() => {
      setViewMode('archived');
      setStatusFilter('all');
    }}
    className={`px-6 py-3 rounded-xl text-lg font-semibold transition-colors ${
      viewMode === 'archived'
        ? 'bg-[var(--color-primary)] text-[var(--color-white)] shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    Appointments History
  </button>
</div>


      {/* Results Counter */}
      <div className="mb-4 text-gray-700">
        Showing {sortedAppointments.length}{' '}
        {sortedAppointments.length === 1 ? 'appointment' : 'appointments'}
        {statusFilter !== 'all' && ` with status: ${statusFilter}`}
        {categoryFilter !== 'all' && ` in category: ${getCategoryName(categoryFilter)}`}
        {searchTerm && ` matching: "${searchTerm}"`}
      </div>

      {/* Appointments Grid */}
      {sortedAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-lg text-gray-600">No appointments found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setDateFilter('all');
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAppointments.map((appointment) => {
            const service = appointment.service_id || {};
            const pet = appointment.pet_id || {};
            const owner = pet.owner_id || {};
            const category = service.service_category;
            const scheduled = hasSchedule(appointment._id, category);
            return (
              <div key={appointment._id} className="relative bg-white border rounded-xl p-6 shadow hover:shadow-lg transition-shadow">
                {/* Schedule buttons */}
                {appointment.status === 'confirmed' && !scheduled && (
                  <button
                    onClick={() => handleSchedule(appointment)}
                    className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    title="Create Schedule"
                  >
                    <FaCalendarPlus />
                  </button>
                )}
                {appointment.status === 'confirmed' && scheduled && (
                  <button
                    onClick={() => handleViewSchedule(appointment)}
                    className="absolute top-4 right-4 bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 transition-colors"
                    title="View Schedule"
                  >
                    <FaCalendarAlt />
                  </button>
                )}
                {/* Status and Category Badge */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full ${getCategoryBadge(category)}`}>
                    {getCategoryName(category)}
                  </span>
                </div>
                {/* Service Name */}
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.service_name}</h3>
                {/* Appointment Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-500">Pet:</span>
                    <span className="text-sm text-gray-700">{pet.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-500">Owner:</span>
                    <span className="text-sm text-gray-700">{owner.full_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-500">Phone:</span>
                    <span className="text-sm text-gray-700">{owner.phone_number}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-500">Date:</span>
                    <span className="text-sm text-gray-700">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-500">Package:</span>
                    <span className="text-sm text-gray-700">{appointment.package_type || 'Standard'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-sm font-medium text-gray-500">Discount:</span>
                    <span className="text-sm text-gray-700">{appointment.discount_applied || 0}%</span>
                  </div>
                </div>
                {/* Action Buttons */}
                {viewMode === 'active' && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => handleConfirm(appointment._id)}
                        className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        <FaCheck className="mr-1" /> Confirm
                      </button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleComplete(appointment._id)}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                          <FaThumbsUp className="mr-1" /> Complete
                        </button>
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          className="text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                        >
                          <FaTimes className="mr-1" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}
                {viewMode === 'archived' && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="text-white bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                      >
                        <FaTrash className="mr-1" /> Remove
                      </button>
                    )}
                  </div>
                )}
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