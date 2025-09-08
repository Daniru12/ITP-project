import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash, 
  Tag, 
  Calendar, 
  Percent, 
  Users, 
  DollarSign,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowLeft
} from 'lucide-react';

const PromoCodeManagement = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    startDate: '',
    endDate: '',
    maxUses: '',
    minPurchaseAmount: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    promoId: null,
    promoCode: ''
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${backendUrl}/api/promocodes/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPromoCodes(response.data);
    } catch (error) {
      toast.error('Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(
          `${backendUrl}/api/promocodes/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        toast.success('Promo code updated successfully');
      } else {
        await axios.post(
          `${backendUrl}/api/promocodes/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        toast.success('Promo code created successfully');
      }

      setIsModalOpen(false);
      setFormData({
        code: '',
        discount: '',
        startDate: '',
        endDate: '',
        maxUses: '',
        minPurchaseAmount: ''
      });
      setEditingId(null);
      fetchPromoCodes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving promo code');
    }
  };

  const handleDeleteClick = (promo) => {
    setDeleteModal({
      isOpen: true,
      promoId: promo._id,
      promoCode: promo.code
    });
  };

  const handleDeleteConfirm = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = localStorage.getItem('token');
        
        await axios.delete(
        `${backendUrl}/api/promocodes/${deleteModal.promoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        toast.success('Promo code deleted successfully');
      setDeleteModal({ isOpen: false, promoId: null, promoCode: '' });
        fetchPromoCodes();
      } catch (error) {
        toast.error('Failed to delete promo code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary-light)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-accent-light)] p-8">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-2xl transition-all sm:w-full sm:max-w-lg">
              <div className="relative p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="absolute -inset-1 rounded-full bg-red-100 animate-pulse"></div>
                    <div className="relative h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertOctagon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-[var(--text-on-secondary)] mb-2">
                    Delete Promo Code?
                  </h3>

                  <div className="mt-2 space-y-2 text-center">
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">
                      You are about to delete
                    </p>
                    <p className="text-lg font-medium text-[var(--text-on-secondary)] px-4 py-2 bg-[var(--color-primary-light)] rounded-lg inline-block">
                      {deleteModal.promoCode}
                    </p>
                    <p className="text-sm text-[var(--text-on-secondary)] opacity-70">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0 space-y-3 space-y-reverse">
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: false, promoId: null, promoCode: '' })}
                    className="inline-flex justify-center items-center px-6 py-3 rounded-xl text-sm font-medium text-[var(--text-on-secondary)] bg-[var(--color-white)] border-2 border-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="inline-flex justify-center items-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Promo Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="group flex items-center gap-2 px-4 py-2 bg-[var(--color-white)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] border border-[var(--color-primary-light)]"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-on-secondary)] mb-2">Promo Code Management</h1>
                <p className="text-[var(--text-on-secondary)] opacity-70">Create and manage promotional codes for your store</p>
              </div>
            </div>
          <button
            onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Create Promo Code
          </button>
        </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Promo Codes */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-blue-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Total
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Promo Codes</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">{promoCodes.length}</p>
              <p className="ml-2 text-sm text-blue-600 font-medium">Codes</p>
            </div>
          </div>

          {/* Active Promo Codes */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-green-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Active
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Active Promo Codes</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">
                {promoCodes.filter(promo => promo.isActive).length}
              </p>
              <p className="ml-2 text-sm text-green-600 font-medium">Active</p>
            </div>
          </div>

          {/* Average Discount */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Percent className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-purple-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Average
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Average Discount</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">
                {promoCodes.length > 0
                  ? (promoCodes.reduce((acc, promo) => acc + promo.discount, 0) / promoCodes.length).toFixed(1)
                  : 0}%
              </p>
              <p className="ml-2 text-sm text-purple-600 font-medium">Off</p>
            </div>
          </div>

          {/* Total Usage */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border border-yellow-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-yellow-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                Usage
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Usage</h3>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-800">
                {promoCodes.reduce((acc, promo) => acc + (promo.currentUses || 0), 0)}
              </p>
              <p className="ml-2 text-sm text-yellow-600 font-medium">Times Used</p>
            </div>
          </div>
        </div>

        {/* Promo Codes List */}
        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[var(--color-primary-light)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h2 className="text-2xl font-bold text-[var(--text-on-secondary)]">Promo Codes</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-on-secondary)] opacity-40" />
                  <input
                    type="text"
                    placeholder="Search promo codes..."
                    className="pl-10 pr-4 py-2 border border-[var(--color-primary-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--text-on-secondary)]"
                  />
                </div>
                <button className="p-2 border border-[var(--color-primary-light)] rounded-lg hover:bg-[var(--color-primary-light)]">
                  <Filter className="h-5 w-5 text-[var(--text-on-secondary)]" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-primary-light)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">
                    <div className="flex items-center space-x-1">
                      <span>Discount</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Valid Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Usage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Min Purchase</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-on-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-primary-light)]">
                {promoCodes.map((promo) => (
                  <tr key={promo._id} className="hover:bg-[var(--color-primary-light)] transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[var(--color-primary-light)] rounded-lg">
                          <Tag className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                        <span className="font-medium text-[var(--text-on-secondary)]">{promo.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {promo.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[var(--text-on-secondary)] opacity-40" />
                        <span className="text-sm text-[var(--text-on-secondary)]">
                          {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-[var(--text-on-secondary)] opacity-40" />
                        <span className="text-sm text-[var(--text-on-secondary)]">
                      {promo.currentUses}/{promo.maxUses || '∞'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-[var(--text-on-secondary)] opacity-40" />
                        <span className="text-sm text-[var(--text-on-secondary)]">
                      Rs.{promo.minPurchaseAmount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                        ${promo.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setEditingId(promo._id);
                            setFormData({
                              code: promo.code,
                              discount: promo.discount,
                              startDate: promo.startDate.split('T')[0],
                              endDate: promo.endDate.split('T')[0],
                              maxUses: promo.maxUses,
                              minPurchaseAmount: promo.minPurchaseAmount
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-[var(--text-on-secondary)] hover:text-[var(--color-primary)] transition duration-150"
                          title="Edit Promo Code"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(promo)}
                          className="text-red-600 hover:text-red-900 transition duration-150"
                          title="Delete Promo Code"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-2xl transition-all sm:w-full sm:max-w-lg">
              {/* Modal Header */}
              <div className="relative p-6 border-b border-[var(--color-primary-light)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[var(--color-primary-light)] rounded-lg">
                      <Tag className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-on-secondary)]">
              {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                      setFormData({
                        code: '',
                        discount: '',
                        startDate: '',
                        endDate: '',
                        maxUses: '',
                        minPurchaseAmount: ''
                      });
                    }}
                    className="p-2 hover:bg-[var(--color-primary-light)] rounded-lg transition-colors duration-200"
                  >
                    <XCircle className="h-5 w-5 text-[var(--text-on-secondary)] opacity-40" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-[var(--text-on-secondary)] opacity-70">
                  {editingId ? 'Update your existing promo code details' : 'Create a new promotional code for your store'}
                </p>
              </div>

              {/* Modal Content */}
              <div className="relative p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Promo Code Input */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Tag className="h-4 w-4 text-blue-500" />
                      <span>Promo Code</span>
                    </label>
                    <div className="relative">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter promo code"
                  required
                />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <div className="h-5 w-5 text-gray-400">
                          <Tag className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
              </div>

                  {/* Discount Input */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Percent className="h-4 w-4 text-green-500" />
                      <span>Discount Percentage</span>
                    </label>
                    <div className="relative">
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Enter discount percentage"
                  required
                  min="0"
                  max="100"
                />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">%</span>
                      </div>
                    </div>
              </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>Start Date</span>
                      </label>
                      <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  required
                />
              </div>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>End Date</span>
                      </label>
                      <div className="relative">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  required
                />
              </div>
                    </div>
                  </div>

                  {/* Max Uses */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4 text-yellow-500" />
                      <span>Maximum Uses (Optional)</span>
                    </label>
                    <div className="relative">
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                        placeholder="Enter maximum number of uses"
                  min="0"
                />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
              </div>

                  {/* Minimum Purchase */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span>Minimum Purchase Amount</span>
                </label>
                    <div className="relative">
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        placeholder="Enter minimum purchase amount"
                  min="0"
                  required
                />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">Rs.</span>
                      </div>
                    </div>
              </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({
                      code: '',
                      discount: '',
                      startDate: '',
                      endDate: '',
                      maxUses: '',
                      minPurchaseAmount: ''
                    });
                  }}
                      className="px-6 py-3 text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2"
                >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel</span>
                </button>
                <button
                  type="submit"
                      className="px-6 py-3 text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-dark)] transform hover:scale-[1.02] transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      {editingId ? (
                        <>
                          <Edit className="h-4 w-4" />
                          <span>Update Promo Code</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Create Promo Code</span>
                        </>
                      )}
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement; 