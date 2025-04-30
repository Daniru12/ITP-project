import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaStar, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaUser, 
  FaCut, 
  FaBox, 
  FaDownload, 
  FaBullhorn,
  FaEnvelope,
  FaPaw,
  FaPhone,
  FaPlus
} from 'react-icons/fa';

import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import HamsterLoader from '../../components/HamsterLoader';

const ProviderProfile = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        // Fetch provider profile information
        const profileResponse = await axios.get(
          `${backendUrl}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProviderInfo(profileResponse.data);

        // Fetch provider services
        const servicesResponse = await axios.get(
          `${backendUrl}/api/grooming/provider`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setServices(servicesResponse.data.services || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching provider data:", error);
        setError("Failed to load provider data");
        toast.error("Failed to load provider data");
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  // Function to format price display
  const formatPrice = (price) => {
    return `Rs.${price.toFixed(2)}`;
  };

  const generateServiceReport = () => {
    const doc = new jsPDF();

    // Theme colors from index.css
    const themeColors = {
      primary: [188, 70, 38], // Terracotta Red (#BC4626)
      secondary: [223, 165, 93], // Sandy Gold (#DFA55D)
      accent: [52, 116, 134], // Teal Blue (#347486)
      background: [255, 255, 255], // White (#FFFFFF)
      text: [51, 51, 51], // Dark Gray (#333333)
      lightText: [149, 165, 166], // Gray
    };

    // Helper function for adding page header
    const addPageHeader = (pageNumber) => {
      // Header background with gradient
      doc.setFillColor(...themeColors.primary);
      doc.rect(0, 0, 210, 45, "F");

      // Add decorative elements
      doc.setFillColor(...themeColors.secondary);
      doc.circle(15, 15, 5, "F");
      doc.circle(195, 15, 5, "F");

      // Add logo/text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("PET CARE SERVICES", 20, 20);

      // Main title
      doc.setFontSize(26);
      doc.text("Service Analysis Report", 20, 35);

      // Add date
      doc.setFontSize(10);
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated: ${today}`, 160, 20);
    };

    // Helper function for creating analysis boxes
    const createAnalysisBox = (title, content, x, y, width, height) => {
      // Box background
      doc.setFillColor(...themeColors.background);
      doc.roundedRect(x, y, width, height, 3, 3, "F");

      // Box border
      doc.setDrawColor(...themeColors.accent);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, width, height, 3, 3);

      // Title
      doc.setTextColor(...themeColors.accent);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(title, x + 10, y + 15);

      // Content
      doc.setTextColor(...themeColors.text);
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(content, x + 10, y + 25);
    };

    // Initialize first page
    addPageHeader(1);

    // Calculate statistics
    const totalServices = services.length;
    const availableServices = services.filter((s) => s.is_available).length;
    const unavailableServices = totalServices - availableServices;
    const totalPackages = services.reduce(
      (acc, service) =>
        acc + (service.packages ? Object.keys(service.packages).length : 0),
      0
    );

    // Calculate average price
    const allPrices = services.flatMap((service) =>
      service.packages
        ? Object.values(service.packages).map((p) => p.price)
        : []
    );
    const averagePrice =
      allPrices.length > 0
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
      "Provider Summary",
      `Name: ${providerInfo?.full_name || "N/A"}\nEmail: ${
        providerInfo?.email || "N/A"
      }\nPhone: ${providerInfo?.phone_number || "N/A"}`,
      20,
      yPosition,
      170,
      40
    );

    // Service Statistics Section
    yPosition += 50;
    createAnalysisBox(
      "Service Statistics",
      `Total Services: ${totalServices}\nAvailable Services: ${availableServices}\nUnavailable Services: ${unavailableServices}\nTotal Packages: ${totalPackages}`,
      20,
      yPosition,
      170,
      50
    );

    // Financial Analysis Section
    yPosition += 60;
    createAnalysisBox(
      "Financial Analysis",
      `Average Package Price: ${formatPrice(
        averagePrice
      )}\nTotal Revenue Potential: ${formatPrice(
        averagePrice * totalPackages
      )}`,
      20,
      yPosition,
      170,
      40
    );

    // Service Distribution Section
    yPosition += 50;
    let distributionText = "Service Categories:\n";
    Object.entries(serviceCategories).forEach(([category, count]) => {
      const percentage = ((count / totalServices) * 100).toFixed(1);
      distributionText += `${category.replace(
        "_",
        " "
      )}: ${count} (${percentage}%)\n`;
    });

    createAnalysisBox(
      "Service Distribution",
      distributionText,
      20,
      yPosition,
      170,
      60
    );

    // Availability Analysis Section
    yPosition += 70;
    const availabilityPercentage = (
      (availableServices / totalServices) *
      100
    ).toFixed(1);
    createAnalysisBox(
      "Availability Analysis",
      `Service Availability: ${availabilityPercentage}%\n${availableServices} out of ${totalServices} services are currently available`,
      20,
      yPosition,
      170,
      40
    );

    // Add footer
    doc.setFillColor(...themeColors.background);
    doc.rect(0, 280, 210, 20, "F");
    doc.setFontSize(8);
    doc.setTextColor(...themeColors.lightText);
    doc.text("© 2024 Pet Care Services - Service Analysis Report", 20, 290);

    // Save the PDF
    const dateStr = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    doc.save(`pet-care-analysis-${dateStr}.pdf`);
    
    toast.success('Report downloaded successfully');
  };

  if (loading) {
    return <HamsterLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <FaPaw className="mx-auto text-red-500 mb-4 w-12 h-12 opacity-50" />
          <p className="text-xl text-red-500 mb-2">{error}</p>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  function handleDeleteService(serviceId) {
    // Show confirmation dialog before deleting
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Profile Info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                {providerInfo?.profile_picture ? (
                  <img
                    src={providerInfo.profile_picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-offset-2"
                    style={{ borderColor: 'var(--color-accent)' }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-offset-2" style={{ borderColor: 'var(--color-accent)' }}>
                    <FaUser className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {providerInfo?.full_name || "Service Provider"}
                </h1>
                <p className="text-gray-500">Professional Provider</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link 
                to="/edit-profile" 
                className="flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
              
              <button
                onClick={generateServiceReport}
                className="flex items-center px-4 py-2 rounded-lg text-white transition-all"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
              {/* Contact Info */}
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-accent)' }}>Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                      <FaEnvelope className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 break-all text-sm">{providerInfo?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                      <FaPhone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900 text-sm">{providerInfo?.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="p-5">
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-accent)' }}>Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    to="/AppointmentLIST"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <FaCalendarAlt className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800">Appointments</span>
                  </Link>
                  
                  <Link 
                    to="/product-management"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <FaBox className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800">Products</span>
                  </Link>
                  
                  <Link 
                    to="/provider/order-management"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <FaBox className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800">Orders</span>
                  </Link>
                  
                  <Link 
                    to="/AdReviewComponent"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <FaBullhorn className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800">Advertisements</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Services Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                    <FaCut className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>My Services</h2>
                </div>
                <Link 
                  to="/add-service"
                  className="flex items-center px-4 py-2 rounded-lg text-white transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Service
                </Link>
              </div>
              
              <div className="p-6">
                {services.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FaCut className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg">No services added yet</p>
                    <p className="text-sm text-gray-400 mt-2">Start by adding your first service!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div key={service._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>{service.service_name}</h3>
                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md capitalize">
                              {service.service_category.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mt-2 text-sm line-clamp-2">{service.description}</p>
                        </div>
                        
                        <div className="p-5 bg-gray-50">
                          <div className="space-y-2 mb-4">
                            {service.packages && Object.entries(service.packages).map(([tier, details]) => (
                              <div key={tier} className="flex justify-between items-center bg-white rounded-md p-2 shadow-sm">
                                <div>
                                  <span className="capitalize font-medium text-sm">{tier}</span>
                                  <p className="text-xs text-gray-500">{details.duration} mins</p>
                                </div>
                                <span className="font-semibold text-sm">{formatPrice(details.price)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              service.is_available 
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {service.is_available ? 'Available' : 'Unavailable'}
                            </span>
                            <div className="flex space-x-3">
                              <Link 
                                to={`/update-service/${service._id}`} 
                                className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <FaEdit className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleDeleteService(service._id)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Advertisements Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                    <FaBullhorn className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>My Advertisements</h2>
                </div>
                <Link 
                  to="/AddAdvertisementForm"
                  className="flex items-center px-4 py-2 rounded-lg text-white transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Advertisement
                </Link>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <FaBullhorn className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">Manage all your advertisements from here.</p>
                  <Link
                    to="/AdReviewComponent"
                    className="inline-flex items-center mt-4 px-4 py-2 rounded-lg text-white transition-all"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    View All Advertisements
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-8 flex justify-center opacity-30">
        <FaPaw size={20} className="text-gray-300 transform rotate-12 mx-1" />
        <FaPaw size={15} className="text-gray-300 transform -rotate-12 mx-1" />
        <FaPaw size={20} className="text-gray-300 transform rotate-12 mx-1" />
      </div>
    </div>
  );
};

export default ProviderProfile;