import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash, Tag } from 'lucide-react';

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const token = localStorage.getItem('token');
        
        await axios.delete(
          `${backendUrl}/api/promocodes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        toast.success('Promo code deleted successfully');
        fetchPromoCodes();
      } catch (error) {
        toast.error('Failed to delete promo code');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Promo Code Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="h-5 w-5" />
            Create Promo Code
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Valid Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Min Purchase</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{promo.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{promo.discount}%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(promo.startDate).toLocaleDateString()} - 
                      {new Date(promo.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {promo.currentUses}/{promo.maxUses || '∞'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Rs.{promo.minPurchaseAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo._id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Uses (Optional)</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Purchase Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
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
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement; 