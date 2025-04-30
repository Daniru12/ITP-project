// src/pages/admin/AdvertisingManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  FiEdit, FiTrash2, FiSearch, FiFilter,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiPlusCircle
} from 'react-icons/fi';
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

      const adsData = Array.isArray(response.data) ? response.data : response.data.ads || [];

      const formattedAds = adsData.map(ad => ({
        id: ad._id,
        title: ad.title || 'Untitled',
        description: ad.description || '',
        imageUrl: ad.image_url || '',
        startDate: ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'N/A',
        endDate: ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'N/A',
        approvalStatus: ad.status || 'pending', // ← use backend status
      }));

      setAds(formattedAds);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch ads';
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
    const matchesStatus = selectedStatus === 'All' || ad.approvalStatus.toLowerCase() === selectedStatus.toLowerCase();
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
      toast.error(err.response?.data?.message || 'Failed to delete advertisement');
    }
  };

  const handleEditAd = (adId) => {
    navigate(`/update-ad/${adId}`);
  };

  const handleApproveAd = async (adId) => {
    try {
      const token = getToken();
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await axios.put(`${apiUrl}/api/advertisement/approve/${adId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data;
      setAds(ads.map(ad => ad.id === adId ? {
        ...ad,
        approvalStatus: updated.status
      } : ad));
      toast.success('Advertisement approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve advertisement');
    }
  };

  const handleRejectAd = async (adId) => {
    try {
      const token = getToken();
      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await axios.put(`${apiUrl}/api/advertisement/reject/${adId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data;
      setAds(ads.map(ad => ad.id === adId ? {
        ...ad,
        approvalStatus: updated.status
      } : ad));
      toast.success('Advertisement rejected');
    } catch (err) {
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
        <h2 className="text-4xl font-bold text-[#333333] mb-4 md:mb-0">Advertisement Management</h2>
        <button 
          onClick={() => navigate('/admin/Form')}
          className="flex items-center bg-[#BC4626] text-white px-6 py-3 rounded-lg hover:bg-[#a33d21] shadow-md transition-all text-lg"
        >
          <FiPlusCircle className="mr-2" />
          Add New Ad
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute top-3 left-3 text-[#347486] text-lg" />
            <input
              type="text"
              placeholder="Search advertisements..."
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute top-3 left-3 text-[#347486] text-lg" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg"
            >
              <option value="All">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#347486] text-white text-left">
              <tr>
                <th className="px-6 py-4">Ad</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    <img src={ad.imageUrl} alt="Ad" className="h-12 w-12 rounded-full object-cover mr-4" />
                    <div>
                      <div className="font-medium">{ad.title}</div>
                      <div className="text-sm text-gray-500">{ad.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold capitalize">{ad.approvalStatus}</td>
                  <td className="px-6 py-4">{ad.startDate} → {ad.endDate}</td>
                  <td className="px-6 py-4 flex space-x-3 text-lg">
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
    </div>
  );
};

export default AdvertisingManagement;
