import React, { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const PetBookEntry = ({ entry, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEntry(prev => ({
      ...prev,
      [name]: name === 'metrics' ? { ...prev.metrics, [e.target.dataset.metric]: value } : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      const response = await axios.put(
        `${backendUrl}/api/petbook/${entry._id}`,
        editedEntry,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    }
  };

  // Handle entry deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        await axios.delete(`${backendUrl}/api/petbook/${entry._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onDelete(entry._id);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-[var(--color-secondary-light)] hover:shadow-md transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
              <input
                type="text"
                name="title"
                value={editedEntry.title}
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
                value={editedEntry.category}
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
                value={editedEntry.description}
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
                value={editedEntry.metrics?.weight || ''}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
              />
              <input
                type="text"
                placeholder="Mood"
                data-metric="mood"
                name="metrics"
                value={editedEntry.metrics?.mood || ''}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
              />
              <input
                type="number"
                placeholder="Activity (mins)"
                data-metric="activity_duration"
                name="metrics"
                value={editedEntry.metrics?.activity_duration || ''}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <FaSave className="mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 border border-[var(--color-secondary-light)] hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            {entry.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              {format(new Date(entry.date), 'PPP')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" 
              style={{
                backgroundColor: `var(--color-${entry.category === 'Health' ? 'primary' : 
                  entry.category === 'Activity' ? 'secondary' : 
                  'accent'}-light)`,
                color: `var(--color-${entry.category === 'Health' ? 'primary' : 
                  entry.category === 'Activity' ? 'secondary' : 
                  'accent'})`
              }}>
              {entry.category}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-full text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] transition-all duration-300"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all duration-300"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{entry.description}</p>
      
      {entry.metrics && Object.keys(entry.metrics).length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {entry.metrics.weight && (
              <div className="bg-[var(--color-primary-light)] text-[var(--color-primary)] px-4 py-2 rounded-lg">
                <p className="text-xs opacity-75 mb-1">Weight</p>
                <p className="font-medium">{entry.metrics.weight} kg</p>
              </div>
            )}
            {entry.metrics.mood && (
              <div className="bg-[var(--color-secondary-light)] text-[var(--color-secondary)] px-4 py-2 rounded-lg">
                <p className="text-xs opacity-75 mb-1">Mood</p>
                <p className="font-medium">{entry.metrics.mood}</p>
              </div>
            )}
            {entry.metrics.activity_duration && (
              <div className="bg-[var(--color-accent-light)] text-[var(--color-accent)] px-4 py-2 rounded-lg">
                <p className="text-xs opacity-75 mb-1">Activity Duration</p>
                <p className="font-medium">{entry.metrics.activity_duration} mins</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetBookEntry; 