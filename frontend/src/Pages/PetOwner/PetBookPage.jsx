import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PetBook from '../../Components/PetBook/PetBook';
import HamsterLoader from '../../components/HamsterLoader';
import { FaPaw, FaArrowLeft } from 'react-icons/fa';

const PetBookPage = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        const response = await axios.get(`${backendUrl}/api/users/pet/${petId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPet(response.data.pet);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pet:', error);
        setError('Failed to load pet information');
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  if (loading) return <HamsterLoader />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[var(--color-accent-light)]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <FaPaw className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
        <p className="text-xl text-gray-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full hover:shadow-lg transition-all duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[var(--color-accent-light)]">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <FaPaw className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
        <p className="text-xl text-gray-600">Pet not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full hover:shadow-lg transition-all duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[var(--color-accent-light)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300 mb-6 group"
          >
            <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Profile</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-[var(--color-secondary-light)]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                {pet.pet_image && pet.pet_image.length > 0 ? (
                  <img
                    src={pet.pet_image[0]}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--color-accent-light)] flex items-center justify-center">
                    <FaPaw className="w-12 h-12" style={{ color: 'var(--color-accent)' }} />
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                  {pet.name}'s PetBook
                </h1>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="px-4 py-2 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                    {pet.species}
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[var(--color-secondary-light)] text-[var(--color-secondary)]">
                    {pet.breed}
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    {pet.age} years old
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PetBook Component */}
        <PetBook petId={petId} />
      </div>
    </div>
  );
};

export default PetBookPage; 