import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminUpdatePet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    pet_image: []
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to continue');
          navigate('/login');
          return;
        }

        const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/api/users/allpets`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const petData = response.data.pets.find(p => p._id === id);
        if (petData) {
          setPet({
            name: petData.name || '',
            species: petData.species || '',
            breed: petData.breed || '',
            age: petData.age || '',
            gender: petData.gender || '',
            pet_image: petData.pet_image || []
          });
        } else {
          toast.error('Pet not found');
          navigate('/admin/AllPets');
        }
      } catch (error) {
        console.error('Error fetching pet:', error);
        toast.error(error.response?.data?.message || 'Error fetching pet details');
        navigate('/admin/AllPets');
      }
    };

    fetchPet();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPet(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setPet(prevState => ({
      ...prevState,
      pet_image: [e.target.value] // For now, just handle one image URL
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        navigate('/login');
        return;
      }

      const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      await axios.put(
        `${apiUrl}/api/users/admin-update-pet/${id}`,
        pet,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Pet updated successfully');
      navigate('/admin/AllPets');
    } catch (error) {
      console.error('Error updating pet:', error);
      toast.error(error.response?.data?.message || 'Error updating pet');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-[#333333] mb-8">Update Pet Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={pet.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Species
                </label>
                <input
                  type="text"
                  name="species"
                  value={pet.species}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={pet.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  value={pet.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={pet.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-[#333333] mb-2">
                  Pet Image URL
                </label>
                <input
                  type="url"
                  name="pet_image"
                  value={pet.pet_image[0] || ''}
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#347486] focus:ring-2 focus:ring-[#347486]/20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-[#347486] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#2a5d6b] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#347486] focus:ring-offset-2"
              >
                Update Pet
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/AllPets')}
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

export default AdminUpdatePet; 