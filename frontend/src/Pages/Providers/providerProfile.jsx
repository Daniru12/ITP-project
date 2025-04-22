import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaStar, FaEdit, FaTrash, FaCalendarAlt, FaUser, FaCut, FaBox, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import HamsterLoader from '../../Components/HamsterLoader';

const ProviderProfile = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        // Fetch provider profile information
        const profileResponse = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProviderInfo(profileResponse.data);
        
        // Fetch provider services
        const servicesResponse = await axios.get(`${backendUrl}/api/grooming/provider`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setServices(servicesResponse.data.services || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setError('Failed to load provider data');
        toast.error('Failed to load provider data');
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  // Function to format price display
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const generateServiceReport = () => {
    const doc = new jsPDF();
    
    // Theme colors from index.css
    const themeColors = {
      primary: [188, 70, 38],     // Terracotta Red (#BC4626)
      secondary: [223, 165, 93],  // Sandy Gold (#DFA55D)
      accent: [52, 116, 134],     // Teal Blue (#347486)
      background: [255, 255, 255], // White (#FFFFFF)
      text: [51, 51, 51],         // Dark Gray (#333333)
      lightText: [149, 165, 166]  // Gray
    };

    // Helper function for adding page header
    const addPageHeader = (pageNumber) => {
      // Header background with gradient
      doc.setFillColor(...themeColors.primary);
      doc.rect(0, 0, 210, 45, 'F');
      
      // Add decorative elements
      doc.setFillColor(...themeColors.secondary);
      doc.circle(15, 15, 5, 'F');
      doc.circle(195, 15, 5, 'F');
      
      // Add logo/text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('PET CARE SERVICES', 20, 20);
      
      // Main title
      doc.setFontSize(26);
      doc.text('Service Analysis Report', 20, 35);
      
      // Add date
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated: ${today}`, 160, 20);
    };

    // Helper function for creating analysis boxes
    const createAnalysisBox = (title, content, x, y, width, height) => {
      // Box background
      doc.setFillColor(...themeColors.background);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      
      // Box border
      doc.setDrawColor(...themeColors.accent);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, width, height, 3, 3);
      
      // Title
      doc.setTextColor(...themeColors.accent);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, x + 10, y + 15);
      
      // Content
      doc.setTextColor(...themeColors.text);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(content, x + 10, y + 25);
    };

    // Initialize first page
    addPageHeader(1);
    
    // Calculate statistics
    const totalServices = services.length;
    const availableServices = services.filter(s => s.is_available).length;
    const unavailableServices = totalServices - availableServices;
    const totalPackages = services.reduce((acc, service) => 
      acc + (service.packages ? Object.keys(service.packages).length : 0), 0);
    
    // Calculate average price
    const allPrices = services.flatMap(service => 
      service.packages ? Object.values(service.packages).map(p => p.price) : []
    );
    const averagePrice = allPrices.length > 0 
      ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length 
      : 0;
    
    // Calculate service distribution
    const serviceCategories = services.reduce((acc, service) => {
      acc[service.service_category] = (acc[service.service_category] || 0) + 1;
      return acc;
    }, {});
    
    // Provider Summary Section
    let yPosition = 50;
    createAnalysisBox(
      'Provider Summary',
      `Name: ${providerInfo?.full_name || 'N/A'}\nEmail: ${providerInfo?.email || 'N/A'}\nPhone: ${providerInfo?.phone_number || 'N/A'}`,
      20, yPosition, 170, 40
    );
    
    // Service Statistics Section
    yPosition += 50;
    createAnalysisBox(
      'Service Statistics',
      `Total Services: ${totalServices}\nAvailable Services: ${availableServices}\nUnavailable Services: ${unavailableServices}\nTotal Packages: ${totalPackages}`,
      20, yPosition, 170, 50
    );
    
    // Financial Analysis Section
    yPosition += 60;
    createAnalysisBox(
      'Financial Analysis',
      `Average Package Price: ${formatPrice(averagePrice)}\nTotal Revenue Potential: ${formatPrice(averagePrice * totalPackages)}`,
      20, yPosition, 170, 40
    );
    
    // Service Distribution Section
    yPosition += 50;
    let distributionText = 'Service Categories:\n';
    Object.entries(serviceCategories).forEach(([category, count]) => {
      const percentage = ((count / totalServices) * 100).toFixed(1);
      distributionText += `${category.replace('_', ' ')}: ${count} (${percentage}%)\n`;
    });
    
    createAnalysisBox(
      'Service Distribution',
      distributionText,
      20, yPosition, 170, 60
    );
    
    // Availability Analysis Section
    yPosition += 70;
    const availabilityPercentage = ((availableServices / totalServices) * 100).toFixed(1);
    createAnalysisBox(
      'Availability Analysis',
      `Service Availability: ${availabilityPercentage}%\n${availableServices} out of ${totalServices} services are currently available`,
      20, yPosition, 170, 40
    );
    
    // Add footer
    doc.setFillColor(...themeColors.background);
    doc.rect(0, 280, 210, 20, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...themeColors.lightText);
    doc.text('© 2024 Pet Care Services - Service Analysis Report', 20, 290);
    
    // Save the PDF
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-');
    doc.save(`pet-care-analysis-${dateStr}.pdf`);
  };

  if (loading) {
    return (
      <HamsterLoader />
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

function handleDeleteService(serviceId) {
  console.log(serviceId);
  try {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    axios.delete(`${backendUrl}/api/users/service/${serviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success('Service deleted successfully');
    setServices(services.filter(service => service._id !== serviceId));
    window.location.reload();
  } catch (error) {
    console.error('Error deleting service:', error);
    toast.error('Failed to delete service');
  }
}

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {providerInfo?.profile_picture ? (
                  <img
                    src={providerInfo.profile_picture}
                    alt="Profile"
                    className="w-36 h-36 rounded-full mx-auto mb-6 object-cover ring-4 ring-offset-4"
                    style={{ borderColor: 'var(--color-accent)' }}
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full mx-auto mb-6 bg-gray-100 flex items-center justify-center">
                    <FaUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>{providerInfo?.full_name || "Service Provider"}</h1>
              <p className="text-gray-500">Professional Groomer</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 break-all text-sm">{providerInfo?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{providerInfo?.phone_number}</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/edit-profile" 
                className="block text-center px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Edit Profile
              </Link>

              <button
                onClick={generateServiceReport}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <FaDownload className="w-4 h-4" />
                Download Service Report
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Services Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <FaCut className="w-6 h-6 mr-3" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>My Services</h2>
              </div>
              <Link 
                to="/add-service"
                className="px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Add New Service
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-12">
                <FaCut className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No services added yet</p>
                <p className="text-sm text-gray-400 mt-2">Start by adding your first service!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service._id} className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold" style={{ color: 'var(--color-primary)' }}>{service.service_name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full capitalize">
                        {service.service_category.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      {service.packages && Object.entries(service.packages).map(([tier, details]) => (
                        <div key={tier} className="flex justify-between items-center bg-white rounded-lg p-3">
                          <div>
                            <span className="capitalize font-medium text-sm">{tier}</span>
                            <p className="text-xs text-gray-500">{details.duration} mins</p>
                          </div>
                          <span className="font-semibold text-sm">{formatPrice(details.price)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        service.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex space-x-3">
                        <Link 
                          to={`/update-service/${service._id}`} 
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <FaEdit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteService(service._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointments Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <FaCalendarAlt className="w-6 h-6 mr-3" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>Appointments</h2>
              </div>
              <p className="text-gray-600 mb-6">Manage your upcoming appointments and bookings</p>
              <Link 
                to="/AppointmentLIST"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                View Appointments
              </Link>
            </div>

            {/* Products Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <FaBox className="w-6 h-6 mr-3" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>Products</h2>
              </div>
              <p className="text-gray-600 mb-6">Manage your product inventory and listings</p>
              <Link 
                to="/delete-product"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;

