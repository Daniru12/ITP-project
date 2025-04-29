import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiSearch, FiFilter, FiAlertCircle, FiCheckCircle, FiXCircle, FiPlusCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import HamsterLoader from '../../components/HamsterLoader';

const AdvertisingManagement = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddAdModalOpen, setIsAddAdModalOpen] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const redirectToLogin = () => {
    toast.error('Please login to continue');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/advertisement`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data) throw new Error('Empty response from server');

      const adsData = Array.isArray(response.data) ? response.data : response.data.ads || [];

      const formattedAds = adsData.map(ad => ({
        id: ad._id,
        title: ad.title || 'Untitled',
        description: ad.description || '',
        imageUrl: ad.image_url || '',
        startDate: ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'N/A',
        endDate: ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'N/A',
        approvalStatus: ad.approvalStatus || 'Pending',  // Add approval status
      }));

      setAds(formattedAds);
    } catch (err) {
      console.error('Error fetching ads:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to fetch ads';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'All' || ad.approvalStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteAd = async (adId) => {
    try {
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      await axios.delete(`${apiUrl}/api/advertisement/delete/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(ads.filter(ad => ad.id !== adId));
      toast.success('Advertisement deleted successfully');
    } catch (err) {
      console.error('Error deleting ad:', err);
      toast.error(err.response?.data?.message || 'Failed to delete advertisement');
    }
  };

  const handleEditAd = (adId) => {
    navigate(`/api/advertisement/update-ad/${adId}`);
  };

  const handleApproveAd = async (adId) => {
    try {
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      await axios.put(`${apiUrl}/api/advertisement/approve/${adId}`, { approvalStatus: 'Approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(ads.map(ad =>
        ad.id === adId ? { ...ad, approvalStatus: 'Approved' } : ad
      ));
      toast.success('Advertisement approved');
    } catch (err) {
      console.error('Error approving ad:', err);
      toast.error(err.response?.data?.message || 'Failed to approve advertisement');
    }
  };

  const handleRejectAd = async (adId) => {
    try {
      const token = getToken();
      if (!token) {
        redirectToLogin();
        return;
      }
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      await axios.put(`${apiUrl}/api/advertisement/reject/${adId}`, { approvalStatus: 'Rejected' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(ads.map(ad =>
        ad.id === adId ? { ...ad, approvalStatus: 'Rejected' } : ad
      ));
      toast.success('Advertisement rejected');
    } catch (err) {
      console.error('Error rejecting ad:', err);
      toast.error(err.response?.data?.message || 'Failed to reject advertisement');
    }
  };

  if (loading) return <HamsterLoader />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
          <FiAlertCircle className="text-red-500 mr-3 text-xl" />
          <div>
            <h3 className="font-medium">Error Loading Advertisements</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchAds}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-4xl font-bold text-[#333333] mb-4 md:mb-0">Advertising Management</h2>
        <button 
          onClick={() => setIsAddAdModalOpen(true)}
          className="flex items-center bg-[#BC4626] text-white px-6 py-3 rounded-lg hover:bg-[#a33d21] shadow-md transition-all text-lg"
        >
          <FiPlusCircle className="mr-2" />
          Add New Ad
        </button>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute top-3 left-3 text-[#347486] text-lg" />
            <input
              type="text"
              placeholder="Search advertisements..."
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute top-3 left-3 text-[#347486] text-lg" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#347486] focus:border-transparent transition-all"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ads table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#347486]">
              <tr>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase">Ad</th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase">Status</th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase">Dates</th>
                <th className="px-6 py-4 text-left text-base font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <img src={ad.imageUrl} alt="Ad" className="h-12 w-12 rounded-full object-cover mr-4" />
                    <div>
                      <div className="text-base font-medium">{ad.title}</div>
                      <div className="text-sm text-gray-500">{ad.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-semibold">
                    {ad.approvalStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base">
                    {ad.startDate} → {ad.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-3 text-lg">
                    <button onClick={() => handleApproveAd(ad.id)} className="text-green-600 hover:text-green-800">
                      <FiCheckCircle />
                    </button>
                    <button onClick={() => handleRejectAd(ad.id)} className="text-red-600 hover:text-red-800">
                      <FiXCircle />
                    </button>
                    <button onClick={() => handleEditAd(ad.id)} className="text-blue-600 hover:text-blue-800">
                      <FiEdit />
                    </button>
                    <button onClick={() => handleDeleteAd(ad.id)} className="text-[#BC4626] hover:text-[#a33d21]">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ad Modal */}
      {isAddAdModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h3 className="text-3xl font-bold text-[#333333] mb-6">Add New Advertisement</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Title" className="w-full p-3 border rounded-lg" />
              <textarea placeholder="Description" className="w-full p-3 border rounded-lg"></textarea>
              <input type="url" placeholder="Image URL" className="w-full p-3 border rounded-lg" />
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddAdModalOpen(false)} className="px-6 py-3 border rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[#BC4626] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisingManagement;
