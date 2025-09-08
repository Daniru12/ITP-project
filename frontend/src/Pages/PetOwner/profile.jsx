import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPaw, FaShoppingBag, FaUser, FaEdit, FaTrashAlt, FaBook, FaBone, FaPlus } from 'react-icons/fa';
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

        console.log('Profile API Response:', response.data);
        console.log('Profile Picture URL:', response.data.profile_picture);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Card - Takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
              {/* Profile Header Background */}
              <div className="h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"></div>
              
              {/* Profile Content */}
              <div className="px-8 pb-8 -mt-16">
                <div className="relative">
                  {userData.profile_picture ? (
                    <img
                      src={userData.profile_picture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto object-cover ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto bg-gray-100 flex items-center justify-center ring-4 ring-white shadow-lg">
                      <FaUser className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <Link
                    to="/edit-profile-petowner"
                    className="absolute bottom-0 right-1/4 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-2 border-[var(--color-accent)] text-[var(--color-accent)] hover:text-white hover:bg-[var(--color-accent)]"
                  >
                    <FaEdit className="h-5 w-5" />
                  </Link>
                </div>

                <div className="text-center mt-6 mb-8">
                  <h1 className="text-2xl font-bold mb-1 text-gray-800">{userData.full_name}</h1>
                  <p className="text-[var(--color-accent)] font-medium">@{userData.username}</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-5 shadow-inner">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900 break-all">{userData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-gray-900">{userData.phone_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[var(--color-accent-light)] to-white rounded-xl p-6 text-center shadow-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <FaBone className="w-5 h-5 text-[var(--color-accent)]" />
                      <p className="text-[var(--color-primary)] font-semibold">Loyalty Points</p>
                    </div>
                    <p className="text-5xl font-bold text-[var(--color-accent)] mb-2">
                      {userData.loyalty_points || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Points earned from bookings and purchases
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Takes 8 columns */}
          <div className="lg:col-span-8 space-y-8">
            {/* Pets Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-[var(--color-accent-light)] mr-4">
                    <FaPaw className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                    My Pets
                  </h2>
                </div>
                <Link 
                  to="/register-pet" 
                  className="px-6 py-3 rounded-full text-white font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add New Pet
                </Link>
              </div>

              {userPets.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-b from-[var(--color-accent-light)] to-white rounded-2xl">
                  <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <FaPaw className="w-10 h-10 text-[var(--color-accent)]" />
                  </div>
                  <p className="text-gray-700 text-xl font-semibold mb-2">No pets added yet</p>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">Add your first pet to start their journey with PawGo</p>
                  <Link 
                    to="/register-pet" 
                    className="inline-flex items-center px-6 py-3 rounded-full text-white font-medium shadow-md hover:shadow-lg bg-[var(--color-primary)]"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Your First Pet
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userPets.map((pet) => (
                    <div 
                      key={pet._id} 
                      className="bg-white p-6 transition-all duration-300 hover:shadow-lg border border-gray-100 rounded-xl hover:border-[var(--color-accent-light)] group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Image with gradient overlay */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--color-accent)] opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                          <img
                            src={pet.pet_image || "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg"}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[var(--color-primary)] truncate mb-1 group-hover:text-[var(--color-secondary)] transition-colors duration-300">
                            {pet.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-2 text-sm">
                            <span className="px-2 py-1 bg-[var(--color-accent-light)] text-[var(--color-accent)] rounded-full text-xs font-medium">
                              {pet.species}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {pet.breed}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {pet.age} years
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {pet.gender}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/petbook/${pet._id}`}
                            className="p-2 rounded-full text-[var(--color-accent)] hover:text-white hover:bg-[var(--color-accent)] transition-colors duration-200"
                            title="PetBook"
                          >
                            <FaBook className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/edit-pet/${pet._id}`}
                            className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-[var(--color-primary)] transition-colors duration-200"
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeletePet(pet._id)}
                            className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-red-500 transition-colors duration-200"
                            title="Delete"
                          >
                            <FaTrashAlt className="w-4 h-4" />
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
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:bg-gradient-to-br hover:from-white hover:to-[var(--color-accent-light)] group">
                <div className="p-4 bg-[var(--color-accent-light)] rounded-2xl inline-block mb-6 group-hover:bg-white transition-colors duration-300">
                  <FaCalendarAlt className="w-8 h-8 text-[var(--color-accent)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-accent)] mb-3">Appointments</h2>
                <p className="text-gray-600 mb-8 group-hover:text-gray-700">Track and manage your pet grooming appointments and schedules</p>
                <Link 
                  to="/Appointment"
                  className="inline-flex items-center px-6 py-3 rounded-full text-white transition-all duration-300 shadow-md hover:shadow-lg font-medium bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transform group-hover:-translate-y-1"
                >
                  View Appointments
                </Link>
              </div>

              {/* Products Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:bg-gradient-to-br hover:from-white hover:to-[var(--color-accent-light)] group">
                <div className="p-4 bg-[var(--color-accent-light)] rounded-2xl inline-block mb-6 group-hover:bg-white transition-colors duration-300">
                  <FaShoppingBag className="w-8 h-8 text-[var(--color-accent)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-accent)] mb-3">Products</h2>
                <p className="text-gray-600 mb-8 group-hover:text-gray-700">View your pet grooming products, orders, and shopping history</p>
                <Link 
                  to="/ownerOrders"
                  className="inline-flex items-center px-6 py-3 rounded-full text-white transition-all duration-300 shadow-md hover:shadow-lg font-medium bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transform group-hover:-translate-y-1"
                >
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}