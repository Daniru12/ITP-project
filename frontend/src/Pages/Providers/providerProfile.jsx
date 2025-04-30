import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  MdStar,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdPerson,
  MdContentCut,
  MdInventory,
  MdFileDownload,
  MdCampaign,
  MdEmail,
  MdPets,
  MdPhone,
  MdAdd,
  MdInsights,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';

import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import HamsterLoader from '../../components/HamsterLoader';

const ProviderProfile = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [stats, setStats] = useState({
    totalServices: 0,
    availableServices: 0,
    totalPackages: 0,
    averagePrice: 0
  });

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

        const servicesData = servicesResponse.data.services || [];
        setServices(servicesData);
        
        // Calculate stats
        const available = servicesData.filter(s => s.is_available).length;
        const totalPackages = servicesData.reduce(
          (acc, service) => acc + (service.packages ? Object.keys(service.packages).length : 0), 0
        );
        
        const allPrices = servicesData.flatMap(service => 
          service.packages ? Object.values(service.packages).map(p => p.price) : []
        );
        
        const avgPrice = allPrices.length > 0
          ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
          : 0;
          
        setStats({
          totalServices: servicesData.length,
          availableServices: available,
          totalPackages: totalPackages,
          averagePrice: avgPrice
        });
        
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
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
          <MdPets className="mx-auto text-red-500 mb-4 w-16 h-16 opacity-70 animate-pulse" />
          <p className="text-2xl text-red-500 mb-2 font-bold">{error}</p>
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
      {/* Hero Header Section with Profile Info */}
      <div className="bg-gradient-to-r from-red-500 to-amber-40" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between">
            <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
              <div className="relative mb-4">
                {providerInfo?.profile_picture ? (
                  <img
                    src={providerInfo.profile_picture}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg transform hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center ring-4 ring-white shadow-lg transform hover:scale-105 transition-all duration-300">
                    <MdPerson className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-2 border-white">
                  <MdCheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">
                  {providerInfo?.full_name || "Service Provider"}
                </h1>
                <p className="text-white opacity-90 mt-1">Professional Pet Care Provider</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/edit-profile" 
                className="flex items-center justify-center px-6 py-3 rounded-lg border border-white text-white bg-transparent hover:bg-white hover:text-red-500 transition-all shadow-md"
              >
                <MdEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
              
              <button
                onClick={generateServiceReport}
                className="flex items-center justify-center px-6 py-3 rounded-lg bg-white text-red-500 hover:bg-gray-100 transition-all shadow-md"
              >
                <MdFileDownload className="w-4 h-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-5 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Services</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{stats.totalServices}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                  <MdContentCut className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-5 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Available</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{stats.availableServices}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                  <MdCheckCircle className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-5 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Packages</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{stats.totalPackages}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                  <MdInventory className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-5 transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Avg. Price</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>{formatPrice(stats.averagePrice)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                  <MdInsights className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
              {/* Contact Info */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--color-accent)' }}>Contact Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center transform hover:translate-x-2 transition-all duration-300">
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                      <MdEmail className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="font-medium text-gray-900 break-all">{providerInfo?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center transform hover:translate-x-2 transition-all duration-300">
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                      <MdPhone className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="font-medium text-gray-900">{providerInfo?.phone_number}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--color-accent)' }}>Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/AppointmentLIST"
                    className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-all transform hover:translate-x-2 duration-300"
                  >
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <MdCalendarToday className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800 font-medium">Appointments</span>
                  </Link>
                  
                  <Link 
                    to="/product-management"
                    className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-all transform hover:translate-x-2 duration-300"
                  >
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <MdInventory className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800 font-medium">Products</span>
                  </Link>
                  
                  <Link 
                    to="/provider/order-management"
                    className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-all transform hover:translate-x-2 duration-300"
                  >
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <MdInventory className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800 font-medium">Orders</span>
                  </Link>
                  
                  <Link 
                    to="/AdReviewComponent"
                    className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-all transform hover:translate-x-2 duration-300"
                  >
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                      <MdCampaign className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-gray-800 font-medium">Advertisements</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Services Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100" 
                   style={{ background: 'linear-gradient(to right, rgba(188,70,38,0.07), rgba(52,116,134,0.05))' }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                    <MdContentCut className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>My Services</h2>
                </div>
                <Link 
                  to="/add-service"
                  className="flex items-center px-5 py-2.5 rounded-lg text-white transition-all shadow-md transform hover:translate-y-0.5 hover:shadow-lg"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add Service
                </Link>
              </div>
              
              <div className="p-6">
                {services.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <MdContentCut className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                    <p className="text-gray-500 text-xl font-medium">No services added yet</p>
                    <p className="text-gray-400 mt-2 mb-6">Start by adding your first service!</p>
                    <Link 
                      to="/add-service"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg text-white transition-all shadow-md"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <MdAdd className="w-4 h-4 mr-2" />
                      Add Your First Service
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="p-6 border-b border-gray-100" style={{ background: 'linear-gradient(45deg, rgba(188,70,38,0.03), rgba(223,165,93,0.05))' }}>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>{service.service_name}</h3>
                            <span className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full capitalize">
                              {service.service_category.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mt-3 text-sm line-clamp-2">{service.description}</p>
                        </div>
                        
                        <div className="p-5">
                          <div className="space-y-3 mb-5">
                            {service.packages && Object.entries(service.packages).map(([tier, details]) => (
                              <div key={tier} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 hover:shadow-sm transition-all">
                                <div>
                                  <span className="capitalize font-medium">{tier}</span>
                                  <p className="text-xs text-gray-500 mt-0.5">{details.duration} mins</p>
                                </div>
                                <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{formatPrice(details.price)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              service.is_available 
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-red-50 text-red-600'
                            }`}>
                              {service.is_available ? 'Available' : 'Unavailable'}
                            </span>
                            <div className="flex space-x-3">
                              <Link 
                                to={`/update-service/${service._id}`} 
                                className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                title="Edit Service"
                              >
                                <MdEdit className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleDeleteService(service._id)}
                                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete Service"
                              >
                                <MdDelete className="w-4 h-4" />
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
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100"
                   style={{ background: 'linear-gradient(to right, rgba(188,70,38,0.07), rgba(52,116,134,0.05))' }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                    <MdCampaign className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>My Advertisements</h2>
                </div>
                <Link 
                  to="/AddAdvertisementForm"
                  className="flex items-center px-5 py-2.5 rounded-lg text-white transition-all shadow-md transform hover:translate-y-0.5 hover:shadow-lg"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add Advertisement
                </Link>
              </div>
              
              <div className="p-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-8 text-center border border-dashed border-gray-200">
                  <div className="rounded-full bg-white p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md" style={{ borderColor: 'var(--color-accent)', borderWidth: '2px' }}>
                    <MdCampaign className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>Boost Your Business</h3>
                  <p className="text-gray-600 mb-6">Create eye-catching advertisements to attract more customers to your services.</p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link
                      to="/AddAdvertisementForm"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg text-white transition-all shadow-md"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <MdAdd className="w-4 h-4 mr-2" />
                      Create New Ad
                    </Link>
                    <Link
                      to="/AdReviewComponent"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg transition-all"
                      style={{ backgroundColor: 'rgba(52, 116, 134, 0.1)', color: 'var(--color-accent)' }}
                    >
                      View All Advertisements
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Analytics Summary */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100"
                   style={{ background: 'linear-gradient(to right, rgba(52,116,134,0.07), rgba(188,70,38,0.05))' }}>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                    <MdInsights className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Analytics Summary</h2>
                </div>
                <button
                  onClick={generateServiceReport}
                  className="flex items-center px-5 py-2.5 rounded-lg transition-all shadow-md transform hover:translate-y-0.5 hover:shadow-lg"
                  style={{ backgroundColor: 'rgba(52, 116, 134, 0.1)', color: 'var(--color-accent)' }}
                >
                  <MdFileDownload className="w-4 h-4 mr-2" />
                  Full Report
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm uppercase font-medium text-gray-500 mb-1">Service Availability</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                          {stats.availableServices}/{stats.totalServices}
                        </p>
                        <p className="text-sm text-gray-500">Services Active</p>
                      </div>
                      <div className="h-8 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${stats.totalServices ? (stats.availableServices/stats.totalServices)*100 : 0}%`,
                            backgroundColor: 'var(--color-accent)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm uppercase font-medium text-gray-500 mb-1">Package Options</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                          {stats.totalPackages}
                        </p>
                        <p className="text-sm text-gray-500">Total Packages</p>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className="h-8 w-3 rounded-sm" 
                            style={{ 
                              backgroundColor: i < Math.min(stats.totalPackages, 5) ? 'var(--color-accent)' : 'rgba(52, 116, 134, 0.2)',
                              opacity: i < Math.min(stats.totalPackages, 5) ? (1 - (i * 0.15)) : 0.2
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm uppercase font-medium text-gray-500 mb-1">Average Price</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                          {formatPrice(stats.averagePrice)}
                        </p>
                        <p className="text-sm text-gray-500">Per Package</p>
                      </div>
                      <div className="flex items-end h-8">
                        <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                        <div className="w-3 h-5 mx-1 bg-gray-300 rounded-sm"></div>
                        <div className="w-3 h-8 bg-blue-300 rounded-sm" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-5 text-center border border-gray-100">
                  <p className="text-gray-600 mb-4">Download the complete analytics report to gain deeper insights into your services</p>
                  <button
                    onClick={generateServiceReport}
                    className="inline-flex items-center px-6 py-3 rounded-lg text-white transition-all shadow-md"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    <MdFileDownload className="w-4 h-4 mr-2" />
                    Generate Detailed Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-12 flex flex-col items-center">
        <div className="flex justify-center mb-3">
          <MdPets size={20} className="text-gray-300 transform rotate-12 mx-1 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.1s' }} />
          <MdPets size={15} className="text-gray-300 transform -rotate-12 mx-1 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          <MdPets size={20} className="text-gray-300 transform rotate-12 mx-1 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        </div>
        <p className="text-gray-400 text-sm">© 2025 Pet Care Services. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ProviderProfile;