import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaStar, FaEdit, FaTrash, FaCalendarAlt, FaUser, 
  FaCut, FaBox, FaDownload, FaBullhorn, FaPlus, 
  FaPaw, FaEnvelope, FaPhone, FaChevronRight 
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
    return `Rs.${price.toFixed(2)}`;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <HamsterLoader />
      </div>
    );
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
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  }

  // Stats data for provider dashboard
  const stats = [
    {
      label: 'Services',
      value: services.length,
      icon: <FaCut />,
      color: 'var(--color-primary)'
    },
    {
      label: 'Available',
      value: services.filter(s => s.is_available).length,
      icon: <FaStar />,
      color: 'var(--color-accent)'
    },
    {
      label: 'Packages',
      value: services.reduce((acc, service) => 
        acc + (service.packages ? Object.keys(service.packages).length : 0), 0),
      icon: <FaBox />,
      color: 'var(--color-primary)'
    }
  ];

  const QuickLinkButton = ({ to, icon, label, primary = true }) => (
    <Link
      to={to}
      className="flex items-center px-4 py-3 rounded-lg transition-all group hover:shadow-sm border border-gray-100"
      style={{ backgroundColor: primary ? 'var(--color-primary)' : 'var(--color-accent)', opacity: 0.9 }}
    >
      <div className="bg-white/20 p-2.5 rounded-lg mr-4">
        {React.cloneElement(icon, { className: "w-5 h-5 text-white" })}
      </div>
      <span className="text-white font-medium">{label}</span>
      <FaChevronRight className="w-3 h-3 ml-auto text-white/70 group-hover:text-white transition-all" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with avatar */}
      <div 
        className="h-48 pt-16 relative mb-24"
        style={{ 
          background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center">
            <div className="absolute -bottom-20 bg-white p-2 rounded-full shadow-lg">
              {providerInfo?.profile_picture ? (
                <img
                  src={providerInfo.profile_picture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaUser className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            <div className="ml-44">
              <h1 className="text-3xl font-bold text-white">{providerInfo?.full_name || "Service Provider"}</h1>
              <p className="text-white/80">Professional Pet Care Provider</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            
            {/* Profile card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col space-y-4 p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                    <FaEnvelope className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-sm text-gray-900 break-all">{providerInfo?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}>
                    <FaPhone className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-sm text-gray-900">{providerInfo?.phone_number}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex space-x-3">
                <Link 
                  to="/edit-profile" 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Profile
                </Link>
                
                <button
                  onClick={generateServiceReport}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)' }}
                >
                  <FaDownload className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: stat.color, opacity: 0.1 }}
                  >
                    {React.cloneElement(stat.icon, { 
                      className: "w-4 h-4", 
                      style: { color: stat.color } 
                    })}
                  </div>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Quick Links</h3>
              
              <QuickLinkButton 
                to="/AppointmentLIST"
                icon={<FaCalendarAlt />}
                label="Appointments"
              />
              
              <QuickLinkButton 
                to="/product-management"
                icon={<FaBox />}
                label="Products"
                primary={false}
              />
              
              <QuickLinkButton 
                to="/provider/order-management"
                icon={<FaBox />}
                label="Orders"
              />
              
              <QuickLinkButton 
                to="/AdReviewComponent"
                icon={<FaBullhorn />}
                label="Advertisements"
                primary={false}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="border-b border-gray-100">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'services' 
                        ? 'border-current text-current' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ color: activeTab === 'services' ? 'var(--color-primary)' : '' }}
                  >
                    <FaCut className="w-4 h-4 mr-2" />
                    Services
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('ads')}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                      activeTab === 'ads' 
                        ? 'border-current text-current' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ color: activeTab === 'ads' ? 'var(--color-primary)' : '' }}
                  >
                    <FaBullhorn className="w-4 h-4 mr-2" />
                    Advertisements
                  </button>
                </div>
              </div>
            
              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'services' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>My Services</h2>
                      <Link 
                        to="/add-service"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm transition-all"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        <FaPlus className="w-3.5 h-3.5 mr-2" />
                        Add Service
                      </Link>
                    </div>
                    
                    {services.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                        <div 
                          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
                        >
                          <FaCut className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="text-gray-600 font-medium mb-2">No services added yet</p>
                        <p className="text-sm text-gray-500 mb-6">Start by adding your first pet care service</p>
                        <Link 
                          to="/add-service"
                          className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm transition-all"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          <FaPlus className="w-3.5 h-3.5 mr-2" />
                          Add First Service
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {services.map((service) => (
                          <div key={service._id} className="rounded-xl border border-gray-100 transition-all hover:shadow-sm overflow-hidden">
                            <div className="flex items-start p-4 border-b border-gray-100">
                              {/* Service status indicator */}
                              <div 
                                className={`h-2 w-2 mt-2 mr-3 rounded-full flex-shrink-0 ${
                                  service.is_available ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              ></div>
                              
                              {/* Service info */}
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                                    {service.service_name}
                                  </h3>
                                  <span 
                                    className="text-xs px-2 py-1 rounded-md capitalize"
                                    style={{ 
                                      backgroundColor: 'var(--color-accent)', 
                                      color: 'white',
                                      opacity: 0.9
                                    }}
                                  >
                                    {service.service_category.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{service.description}</p>
                              </div>
                            </div>
                            
                            {/* Packages */}
                            <div className="bg-gray-50 px-4 py-3">
                              <p className="text-xs text-gray-500 mb-2">Packages</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {service.packages && Object.entries(service.packages).map(([tier, details]) => (
                                  <div key={tier} className="bg-white rounded-lg p-2 border border-gray-100">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <span className="capitalize text-xs font-medium">{tier}</span>
                                        <p className="text-xs text-gray-500">{details.duration} mins</p>
                                      </div>
                                      <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
                                        {formatPrice(details.price)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex justify-end px-4 py-3 border-t border-gray-100">
                              <Link 
                                to={`/update-service/${service._id}`} 
                                className="text-xs px-3 py-1.5 rounded-lg mr-2 transition-all"
                                style={{ backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)', color: 'var(--color-accent)' }}
                              >
                                <FaEdit className="inline w-3 h-3 mr-1" /> Edit
                              </Link>
                              <button 
                                onClick={() => handleDeleteService(service._id)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 transition-all hover:bg-red-100"
                              >
                                <FaTrash className="inline w-3 h-3 mr-1" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'ads' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>My Advertisements</h2>
                      <Link 
                        to="/AddAdvertisementForm"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm transition-all"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        <FaPlus className="w-3.5 h-3.5 mr-2" />
                        Add Advertisement
                      </Link>
                    </div>
                    
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                      <div 
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-accent)', opacity: 0.1 }}
                      >
                        <FaBullhorn className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">Promote your services</p>
                      <p className="text-sm text-gray-500 mb-6">Create advertisements to reach more pet owners</p>
                      <Link 
                        to="/AddAdvertisementForm"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-white text-sm transition-all"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      >
                        <FaPlus className="w-3.5 h-3.5 mr-2" />
                        Create Your First Ad
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer accent */}
      <div className="py-8 flex justify-center opacity-30">
        <FaPaw size={20} className="text-gray-300 transform rotate-12 mx-1" />
        <FaPaw size={15} className="text-gray-300 transform -rotate-12 mx-1" />
        <FaPaw size={20} className="text-gray-300 transform rotate-12 mx-1" />
      </div>
    </div>
  );
};

export default ProviderProfile;