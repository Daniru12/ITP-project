import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiUserPlus, FiSearch, FiFilter, FiAlertCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import HamsterLoader from '../../components/HamsterLoader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const navigate = useNavigate();

  // Format user type for display
  const formatUserType = (userType) => {
    switch(userType) {
      case 'pet_owner':
        return 'Pet Owner';
      case 'service_provider':
        return 'Service Provider';
      case 'admin':
        return 'Admin';
      default:
        return userType;
    }
  };

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Redirect to login page
  const redirectToLogin = () => {
    toast.error('Please login to continue');
    localStorage.removeItem('token'); // Clear invalid token
    navigate('/login');
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      
      if (!token) {
        redirectToLogin();
        return;
      }
      
      // Get the correct API URL
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await axios.get(`${apiUrl}/api/users/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Check if response has data
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      // Handle different response formats
      let usersData = [];
      if (response.data.users) {
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      // Transform user data to match our component's expected format
      const formattedUsers = usersData.map(user => ({
        id: user._id,
        name: user.full_name || 'Unknown',
        username: user.username || 'unknown',
        email: user.email || 'unknown@example.com',
        phone: user.phone_number || 'N/A',
        role: formatUserType(user.user_type),
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
        lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never',
        profilePicture: user.profile_picture || '',
        loyaltyPoints: user.loyalty_points || 0,
        isActive: user.isActive ?? true // Default to true if not set
      }));
      
      setUsers(formattedUsers);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      // More detailed error logging
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Request made but no response received:', err.request);
      }
      
      let errorMessage = 'Failed to fetch users';
      
      if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to view users. Please login as an admin.';
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        setTimeout(() => {
          redirectToLogin();
        }, 3000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteUser = async (userId) => {
    try {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/users/update/${userId}`);
  };

  const roles = ['All', 'Admin', 'Pet Owner', 'Service Provider'];
  const statuses = ['All', 'Active', 'Inactive', 'Pending'];

  // Add new function to handle account deactivation
  const handleToggleAccountStatus = async (userId, currentStatus) => {
    try {
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }

      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.put(
        `${apiUrl}/api/users/deactivate-account/${userId}`,
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        // Update the users list with the new status
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isActive: !currentStatus }
            : user
        ));
        toast.success(`Account ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (err) {
      console.error('Error toggling account status:', err);
      toast.error(err.response?.data?.message || 'Failed to update account status');
    }
  };

  if (loading) {
    return (
      <HamsterLoader />
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3 text-xl" />
          <div>
            <h3 className="font-medium">Error Loading Users</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchUsers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-4xl font-bold text-[#333333] mb-4 md:mb-0">User Management</h2>
        <button 
          className="flex items-center bg-[#BC4626] text-white px-6 py-3 rounded-lg hover:bg-[#a33d21] transition-all duration-300 shadow-md text-lg"
          onClick={() => setIsAddUserModalOpen(true)}
        >
          <FiUserPlus className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-[#347486] text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email"
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-[#347486] text-lg" />
              </div>
              <select
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role} Role</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-[#347486] text-lg" />
              </div>
              <select
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status} Status</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#347486]">
              <tr>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img className="h-12 w-12 rounded-full object-cover" src={user.profilePicture} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-gray-900">{user.name}</div>
                        <div className="text-base text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleAccountStatus(user.id, user.isActive)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <FiToggleRight className="text-green-500 text-lg" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-red-500 text-lg" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-[#347486] hover:text-[#2a5d6b] mr-4 transition-colors duration-300"
                    >
                      <FiEdit className="inline-block text-lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-[#BC4626] hover:text-[#a33d21] transition-colors duration-300"
                    >
                      <FiTrash2 className="inline-block text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-base text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> users
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-base font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-[#347486] text-base font-medium text-white hover:bg-[#2a5d6b]"
                >
                  2
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  3
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-base font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h3 className="text-3xl font-bold text-[#333333] mb-6">Add New User</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base" />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Username</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base" />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base" />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base" />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Password</label>
                <input type="password" className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base" />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all duration-300 text-base">
                  <option value="pet_owner">Pet Owner</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 text-base"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 bg-[#BC4626] text-white rounded-lg hover:bg-[#a33d21] transition-all duration-300 text-base"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 