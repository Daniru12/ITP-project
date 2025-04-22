import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import HamsterLoader from '../../components/HamsterLoader';

const PetDetailsModal = ({ pet, onClose }) => {
  if (!pet) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <FiX className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-[#333333] mb-6">{pet.name}'s Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={pet.pet_image?.[0] || 'https://via.placeholder.com/150'} 
              alt={pet.name}
              className="w-full h-72 object-cover rounded-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#333333] mb-4">Pet Information</h3>
              <div className="space-y-3">
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Species:</span> {pet.species}</p>
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Breed:</span> {pet.breed}</p>
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Age:</span> {pet.age}</p>
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Gender:</span> {pet.gender}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#333333] mb-4">Owner Information</h3>
              <div className="space-y-3">
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Name:</span> {pet.owner_id?.full_name}</p>
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Email:</span> {pet.owner_id?.email}</p>
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Phone:</span> {pet.owner_id?.phone_number}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#333333] mb-4">Registration Details</h3>
              <div className="space-y-3">
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Registered:</span> {new Date(pet.createdAt).toLocaleDateString()}</p>
                <p className="text-base text-gray-600"><span className="font-medium text-[#333333]">Last Updated:</span> {new Date(pet.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PetsManagement = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.get(`${backendUrl}/api/users/allpets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPets(response.data.pets || []); // Changed from response.data to response.data.pets
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError('Failed to load pets');
      toast.error('Failed to load pets');
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this pet? This action cannot be undone.");
    
    if (!isConfirmed) {
      return; // If user cancels, don't proceed with deletion
    }

    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.delete(`${backendUrl}/api/users/admin-delete-pet/${petId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Pet deleted successfully');
      setPets(pets.filter(pet => pet._id !== petId));
    } catch (error) {
      console.error('Error deleting pet:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete pet';
      toast.error(errorMessage);
    }
  };

  const handleEditPet = (e, petId) => {
    e.stopPropagation(); // Prevent row click event
    navigate(`/admin/pets/update/${petId}`);
  };

  if (loading) {
    return (
      <HamsterLoader />
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-[#333333]">Pets Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#347486]">
              <tr>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Pet Info
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr 
                  key={pet._id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => setSelectedPet(pet)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl overflow-hidden">
                        <img 
                          src={pet.pet_image?.[0] || 'https://via.placeholder.com/150'} 
                          alt={pet.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-gray-900">
                          {pet.name}
                        </div>
                        <div className="text-base text-gray-500">
                          {pet.species} • {pet.breed}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900">
                      {pet.owner_id?.full_name || 'Unknown Owner'}
                    </div>
                    <div className="text-base text-gray-500">
                      {pet.owner_id?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                    {new Date(pet.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                    <div className="flex space-x-4">
                      <button 
                        onClick={(e) => handleEditPet(e, pet._id)}
                        className="text-[#347486] hover:text-[#2a5d6b] transition-colors duration-300"
                      >
                        <FiEdit2 className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePet(pet._id);
                        }} 
                        className="text-[#BC4626] hover:text-[#a33d21] transition-colors duration-300"
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

      {selectedPet && (
        <PetDetailsModal 
          pet={selectedPet} 
          onClose={() => setSelectedPet(null)} 
        />
      )}
    </div>
  );
};

export default PetsManagement;
