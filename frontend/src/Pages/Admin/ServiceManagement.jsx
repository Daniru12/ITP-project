import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiX as FiClose, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import HamsterLoader from '../../components/HamsterLoader';
// Component for displaying package information (Basic, Premium, Luxury)
const PackageCard = ({ tier, details }) => {
  return (
    <div className="p-6 border border-gray-100 rounded-xl bg-white">
      <h4 className="text-xl font-bold text-[#333333] capitalize mb-4">{tier}</h4>
      <div className="space-y-3">
        <p className="text-3xl font-bold text-[#347486]">${details.price}</p>
        <p className="text-base text-gray-600">{details.duration} minutes</p>
        <div className="mt-4">
          <p className="text-base font-medium text-[#333333] mb-3">Includes:</p>
          <ul className="list-disc list-inside text-base text-gray-600 space-y-2">
            {details.includes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Component for displaying provider information
const ProviderInfo = ({ provider }) => {
  return (
    <div className="mb-6 p-6 bg-[#347486]/10 rounded-xl">
      <h3 className="text-xl font-bold text-[#333333] mb-4">Provider Information</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FiUser className="text-[#347486] text-xl" />
          <span className="text-base text-gray-700">{provider?.full_name || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-3">
          <FiMail className="text-[#347486] text-xl" />
          <span className="text-base text-gray-700">{provider?.email || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-3">
          <FiPhone className="text-[#347486] text-xl" />
          <span className="text-base text-gray-700">{provider?.phone_number || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

// Modal component for displaying service details
const ServiceDetailsModal = ({ service, onClose }) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-[#333333]">{service.service_name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiClose className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-2 rounded-full text-base font-medium bg-[#347486]/10 text-[#347486]">
              {service.service_category.replace('_', ' ')}
            </span>
            <span className={`px-4 py-2 rounded-full text-base font-medium ${
              service.is_available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {service.is_available ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#333333] mb-3">Description</h3>
            <p className="text-base text-gray-600">{service.description}</p>
          </div>

          <ProviderInfo provider={service.provider_id} />

          <div>
            <h3 className="text-xl font-bold text-[#333333] mb-6">Package Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {service.packages && Object.entries(service.packages).map(([tier, details]) => (
                <PackageCard key={tier} tier={tier} details={details} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ServiceManagement component
const ServiceManagement = () => {
  // State variables
  const [services, setServices] = useState([]); // List of all services
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedService, setSelectedService] = useState(null); // Currently selected service
  const navigate = useNavigate();

  // Fetch services when component mounts
  useEffect(() => {
    fetchServices();
  }, []);

  // Function to fetch all services from the backend
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.get(`${backendUrl}/api/users/services`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setServices(response.data.services);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
      toast.error('Failed to load services');
      setLoading(false);
    }
  };

  // Function to toggle service active status
  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      // Use the admin update service endpoint
      await axios.put(
        `${backendUrl}/api/users/admin-update-service/${serviceId}`,
        { is_available: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the service status in the local state
      setServices(services.map(service => 
        service._id === serviceId 
          ? { ...service, is_available: !service.is_available }
          : service
      ));
      
      toast.success('Service status updated successfully');
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  // Helper function to safely get the basic package price
  const getBasicPrice = (service) => {
    try {
      return service.packages?.basic?.price 
        ? `$${service.packages.basic.price}` 
        : 'N/A';
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to safely get the provider name
  const getProviderName = (service) => {
    if (!service.provider_id) return 'Unknown Provider';
    return service.provider_id.full_name || service.provider_id.username || 'Unknown Provider';
  };

  const handleEditService = (e, serviceId) => {
    e.stopPropagation(); // Prevent row click event
    navigate(`/admin/services/update/${serviceId}`);
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <HamsterLoader />
    );
  }

  async function handleDeleteService(serviceId) {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this service? This action cannot be undone.");
    
    if (!isConfirmed) {
      return; // If user cancels, don't proceed with deletion
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.delete(`${backendUrl}/api/users/admin-delete-service/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Show success message
      toast.success('Service deleted successfully');
      
      // Update local state
      setServices(services.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      // Show more specific error message
      const errorMessage = error.response?.data?.message || 'Failed to delete service. Please try again.';
      toast.error(errorMessage);
    }
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-[#333333]">Services Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#347486]">
              <tr>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Basic Price
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr 
                  key={service._id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => setSelectedService(service)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-gray-900">
                      {service.service_name || 'Unnamed Service'}
                    </div>
                    <div className="text-base text-gray-500">
                      {service.description 
                        ? `${service.description.substring(0, 50)}...`
                        : 'No description available'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-base font-medium rounded-full bg-[#347486]/10 text-[#347486]">
                      {(service.service_category || 'uncategorized').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                    {getProviderName(service)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                    {getBasicPrice(service)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleServiceStatus(service._id, service.is_available);
                      }}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                        service.is_available
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {service.is_available ? (
                        <><FiCheck className="mr-2 text-xl" /> Active</>
                      ) : (
                        <><FiX className="mr-2 text-xl" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                    <div className="flex space-x-4">
                      <button 
                        className="text-[#347486] hover:text-[#2a5d6b] transition-colors duration-300"
                        onClick={(e) => handleEditService(e, service._id)}
                      >
                        <FiEdit2 className="h-6 w-6" />
                      </button>
                      <button 
                        className="text-[#BC4626] hover:text-[#a33d21] transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service._id);
                        }}
                      >
                        <FiTrash2 className="h-6 w-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedService && (
        <ServiceDetailsModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
};

export default ServiceManagement;
