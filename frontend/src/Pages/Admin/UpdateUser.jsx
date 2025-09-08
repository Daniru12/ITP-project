import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const UpdateUser = () => {
  // Get the user ID from URL parameters and initialize navigation
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialize user state with empty values
  const [user, setUser] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    profile_picture: ''
  });

  // Function to check if user is logged in
  const checkUserLogin = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return null;
    }
    return token;
  };

  // Function to get the backend API URL
  const getApiUrl = () => {
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  };

  // Function to fetch user details from the server
  const fetchUserDetails = async () => {
    try {
      // Check if user is logged in
      const token = checkUserLogin();
      if (!token) return;

      // Make API call to get user data
      const response = await axios.get(
        `${getApiUrl()}/api/users/all-users`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Process the response data
      let userData = null;
      if (response.data.users) {
        // If response has users array
        userData = response.data.users.find(u => u._id === id);
      } else if (Array.isArray(response.data)) {
        // If response is an array
        userData = response.data.find(u => u._id === id);
      }

      // If user is found, update the state
      if (userData) {
        setUser({
          username: userData.username || '',
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          profile_picture: userData.profile_picture || ''
        });
      } else {
        // If user is not found, show error and redirect
        toast.error('User not found');
        navigate('/admin/users');
      }
    } catch (error) {
      // Handle any errors that occur
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
      navigate('/admin/users');
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    fetchUserDetails();
  }, [id, navigate]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check if user is logged in
      const token = checkUserLogin();
      if (!token) return;

      // Make API call to update user
      await axios.put(
        `${getApiUrl()}/api/users/update-user/${id}`,
        user,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Show success message and redirect
      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch (error) {
      // Handle any errors that occur
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-[#333333] mb-8">Update User Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={user.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={user.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  name="profile_picture"
                  value={user.profile_picture}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-[#347486] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#2a5d6b] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#347486] focus:ring-offset-2"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser; 