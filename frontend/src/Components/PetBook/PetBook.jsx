import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PetBookEntry from './PetBookEntry';
import { FaPlus, FaTimes, FaPaw } from 'react-icons/fa';

const PetBook = ({ petId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    category: 'Note',
    description: '',
    metrics: {}
  });

  // Fetch all entries for the pet
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        const response = await axios.get(`${backendUrl}/api/petbook/pet/${petId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEntries(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching entries:', error);
        setError('Failed to load pet book entries');
        setLoading(false);
      }
    };

    fetchEntries();
  }, [petId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: name === 'metrics' ? { ...prev.metrics, [e.target.dataset.metric]: value } : value
    }));
  };

  // Handle new entry submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.post(`${backendUrl}/api/petbook`, {
        ...newEntry,
        pet_id: petId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEntries(prev => [response.data, ...prev]);
      setShowNewEntryForm(false);
      setNewEntry({
        title: '',
        category: 'Note',
        description: '',
        metrics: {}
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry');
    }
  };

  // Handle entry update
  const handleUpdate = (updatedEntry) => {
    setEntries(prev =>
      prev.map(entry =>
        entry._id === updatedEntry._id ? updatedEntry : entry
      )
    );
  };

  // Handle entry deletion
  const handleDelete = (entryId) => {
    setEntries(prev => prev.filter(entry => entry._id !== entryId));
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[var(--color-primary)] border-r-[var(--color-secondary)] border-b-[var(--color-accent)] border-l-transparent"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-8 bg-[var(--color-primary-light)] rounded-2xl">
      <FaPaw className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)]" />
      <p className="text-[var(--color-primary)] font-medium">{error}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-primary)]">
          PetBook Entries
        </h2>
        <button
          onClick={() => setShowNewEntryForm(!showNewEntryForm)}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
            showNewEntryForm
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            : 'text-[var(--color-primary)] hover:shadow-lg'
          }`}
        >
          {showNewEntryForm ? (
            <>
              <FaTimes className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <FaPlus className="w-4 h-4 mr-2" />
              Add New Entry
            </>
          )}
        </button>
      </div>

      {showNewEntryForm && (
        <div className="bg-[var(--color-accent-light)] rounded-2xl p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
                <input
                  type="text"
                  name="title"
                  value={newEntry.title}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
                  required
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
                <select
                  name="category"
                  value={newEntry.category}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
                  required
                >
                  <option value="Health">Health</option>
                  <option value="Activity">Activity</option>
                  <option value="Diet">Diet</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Note">Note</option>
                </select>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <textarea
                  name="description"
                  value={newEntry.description}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300 min-h-[100px]"
                  required
                />
              </label>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Optional Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  data-metric="weight"
                  name="metrics"
                  value={newEntry.metrics.weight || ''}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
                />
                <input
                  type="text"
                  placeholder="Mood"
                  data-metric="mood"
                  name="metrics"
                  value={newEntry.metrics.mood || ''}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
                />
                <input
                  type="number"
                  placeholder="Activity (mins)"
                  data-metric="activity_duration"
                  name="metrics"
                  value={newEntry.metrics.activity_duration || ''}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-[var(--color-primary)] hover:shadow-lg transition-all duration-300 flex items-center"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Create Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <FaPaw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-medium">No entries yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first entry to start tracking your pet's journey</p>
          </div>
        ) : (
          entries.map(entry => (
            <PetBookEntry
              key={entry._id}
              entry={entry}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PetBook; 