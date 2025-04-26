import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPaw, FaShoppingBag, FaUser } from 'react-icons/fa';
import HamsterLoader from '../../components/HamsterLoader';

export default function Profile() {
  // State to store user data
  const [userData, setUserData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    profile_picture: '',
    user_type: '',
    loyalty_points: 0
  });
  // State to store user pets
  const [userPets, setUserPets] = useState([]);

  // State for loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        const response = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
        setIsLoading(false);
      }
    };

    const fetchUserPets = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const response = await axios.get(`${backendUrl}/api/users/pets`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserPets(response.data.pets || []);
        console.log(response.data.pets);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user pets:', error);
        toast.error('Failed to load pets');
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchUserPets();
  }, []); // Empty dependency array means this runs once when component mounts

  function handleDeletePet(id) {
    // Show confirmation dialog before deleting
    if (window.confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      axios.delete(`${backendUrl}/api/users/deletePet/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        toast.success('Pet deleted successfully');
        setUserPets(userPets.filter(pet => pet._id !== id));
      })
      .catch((err) => {
        console.error('Error deleting pet:', err);
        toast.error('Failed to delete pet');
      })
    }
  }

  if (isLoading) {
    return <HamsterLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card - Takes 4 columns */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {userData.profile_picture ? (
                  <img
                    src={userData.profile_picture}
                    alt="Profile"
                    className="w-36 h-36 rounded-full mx-auto mb-6 object-cover ring-4 ring-offset-4"
                    style={{ borderColor: 'var(--color-accent)' }}
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full mx-auto mb-6 bg-gray-100 flex items-center justify-center">
                    <FaUser className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <Link
                  to="/edit-profile-petowner"
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ borderColor: 'var(--color-accent)', borderWidth: '2px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>{userData.full_name}</h1>
              <p className="text-gray-500">@{userData.username}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 break-all text-sm">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{userData.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Loyalty Points</p>
                <p className="text-4xl font-bold" style={{ color: 'var(--color-accent)' }}>{userData.loyalty_points || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Points earned from bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Takes 8 columns */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pets Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <FaPaw className="w-6 h-6 mr-3" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>My Pets</h2>
              </div>
              <Link 
                to="/register-pet" 
                className="px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Add New Pet
              </Link>
            </div>

            {userPets.length === 0 ? (
              <div className="text-center py-12">
                <FaPaw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No pets added yet</p>
                <p className="text-sm text-gray-400 mt-2">Add your first pet to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPets.map((pet) => (
                  <div key={pet._id} className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start space-x-4">
                      <div className="w-28 h-28 flex-shrink-0">
                        <img
                          src={pet.pet_image || "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg"}
                          alt={pet.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>{pet.name}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Species</p>
                            <p className="font-medium">{pet.species}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Breed</p>
                            <p className="font-medium">{pet.breed}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium">{pet.age}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium">{pet.gender}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                      <Link 
                        to={`/edit-pet/${pet._id}`} 
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => handleDeletePet(pet._id)} 
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
              <p className="text-gray-600 mb-6">Track and manage your pet grooming appointments</p>
              <Link 
                to="/Appointment"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                View Appointments
              </Link>
            </div>

            {/* Products Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <FaShoppingBag className="w-6 h-6 mr-3" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>Products</h2>
              </div>
              <p className="text-gray-600 mb-6">View your pet grooming products and orders</p>
              <Link 
                to="/ownerOrders"
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
}
