import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import mediaUpload from '../../../utils/mediaUpload';

const UpdatePet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [breed, setBreed] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [petImage, setPetImage] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPetData = async () => {
            try {
                const token = localStorage.getItem('token');
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                
                const response = await axios.get(`${backendUrl}/api/users/pet/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const pet = response.data.pet;
                setName(pet.name);
                setSpecies(pet.species);
                setBreed(pet.breed);
                setGender(pet.gender);
                setAge(pet.age.toString());
                setWeight(pet.weight?.toString() || '');
                setCurrentImages(pet.pet_image || []);
            } catch (error) {
                console.error("Error fetching pet data:", error);
                toast.error("Failed to load pet data");
                navigate("/profile");
            }
        };

        fetchPetData();
    }, [id, navigate]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error("Maximum 5 images allowed");
            return;
        }
        setPetImage(files);
        
        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login to update pet information");
                navigate("/login");
                return;
            }

            // Upload new images if any
            const newImageUrls = [];
            for (let i = 0; i < petImage.length; i++) {
                try {
                    const url = await mediaUpload(petImage[i]);
                    newImageUrls.push(url);
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast.error("Error uploading image");
                    setIsLoading(false);
                    return;
                }
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Combine existing and new images
            const allImages = [...currentImages, ...newImageUrls];
            
            await axios.put(`${backendUrl}/api/users/pet/${id}`, {
                name,
                species,
                breed,
                gender,
                age: Number(age),
                weight: Number(weight),
                pet_image: allImages
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Pet information updated successfully");
            navigate("/profile");
        } catch (error) {
            console.error("Error updating pet:", error);
            toast.error(error.response?.data?.message || "Error updating pet");
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = (index) => {
        const newImages = [...currentImages];
        newImages.splice(index, 1);
        setCurrentImages(newImages);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--color-secondary-light)] to-[var(--color-white)] py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-[var(--text-on-secondary)] mb-4">
                        Update Pet Information
                    </h1>
                    <p className="text-lg text-[var(--text-on-secondary)] opacity-80">
                        Keep your pet's profile up to date
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pet Information Card */}
                        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-[var(--color-primary-light)] p-3 rounded-xl">
                                    <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--text-on-secondary)]">Pet Information</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                                        Pet Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                        placeholder="Enter your pet's name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                                        Species
                                    </label>
                                    <input
                                        type="text"
                                        value={species}
                                        onChange={(e) => setSpecies(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                        placeholder="e.g., Dog, Cat, Bird"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                                        Breed
                                    </label>
                                    <input
                                        type="text"
                                        value={breed}
                                        onChange={(e) => setBreed(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                        placeholder="e.g., Golden Retriever, Persian"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                            placeholder="Age"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-on-secondary)] mb-2">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                            placeholder="Weight"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload Card */}
                        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-[var(--color-accent-light)] p-3 rounded-xl">
                                    <svg className="w-6 h-6 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold text-[var(--text-on-secondary)]">Pet Photos</h2>
                            </div>

                            {/* Current Images Grid */}
                            {currentImages.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-[var(--text-on-secondary)] mb-4">Current Photos</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {currentImages.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={image}
                                                    alt={`Current ${index + 1}`}
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Preview Grid */}
                            {previewImages.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-[var(--text-on-secondary)] mb-4">New Photos</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newImages = [...petImage];
                                                        const newPreviews = [...previewImages];
                                                        newImages.splice(index, 1);
                                                        newPreviews.splice(index, 1);
                                                        setPetImage(newImages);
                                                        setPreviewImages(newPreviews);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="pet-image-upload"
                                />
                                <label
                                    htmlFor="pet-image-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-lg text-gray-500 mb-2">
                                        Add New Photos
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        Maximum 5 images allowed
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="flex items-center text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Profile
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-[var(--text-on-primary)] px-8 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Update Pet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePet;
