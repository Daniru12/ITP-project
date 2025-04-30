import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import mediaUpload from '../../../utils/mediaUpload';

const UpdateService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State for form fields
    const [serviceName, setServiceName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [serviceCategory, setServiceCategory] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // State for package information
    const [basicPackage, setBasicPackage] = useState({
        name: 'Basic',
        price: '',
        description: '',
        duration: '',
        includes: []
    });

    const [premiumPackage, setPremiumPackage] = useState({
        name: 'Premium',
        price: '',
        description: '',
        duration: '',
        includes: []
    });

    const [luxuryPackage, setLuxuryPackage] = useState({
        name: 'Luxury',
        price: '',
        description: '',
        duration: '',
        includes: []
    });

    // Fetch existing service data
    useEffect(() => {
        const fetchServiceData = async () => {
            try {
                const token = localStorage.getItem('token');
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                
                const response = await axios.get(`${backendUrl}/api/users/service/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const service = response.data.service;
                setServiceName(service.service_name);
                setDescription(service.description);
                setLocation(service.location);
                setImageUrl(service.image || '');
                setIsAvailable(service.is_available);
                setServiceCategory(service.service_category);

                // Set package information
                if (service.packages) {
                    if (service.packages.basic) {
                        setBasicPackage(service.packages.basic);
                    }
                    if (service.packages.premium) {
                        setPremiumPackage(service.packages.premium);
                    }
                    if (service.packages.luxury) {
                        setLuxuryPackage(service.packages.luxury);
                    }
                }
            } catch (error) {
                console.error("Error fetching service data:", error);
                toast.error("Failed to load service data");
                navigate("/provider-profile");
            }
        };

        fetchServiceData();
    }, [id, navigate]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const url = await mediaUpload(file);
                setImageUrl(url);
                toast.success('Image uploaded successfully');
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login to update service");
                navigate("/login");
                return;
            }

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            
            // Prepare packages data
            const packages = {
                basic: basicPackage,
                premium: premiumPackage,
                luxury: luxuryPackage
            };

            // Send updated service data to backend
            await axios.put(`${backendUrl}/api/grooming/service/${id}`, {
                service_name: serviceName,
                service_category: serviceCategory,
                description,
                location,
                image: imageUrl,
                packages,
                is_available: isAvailable
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Service updated successfully");
            navigate("/provider-profile");
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error(error.response?.data?.message || "Error updating service");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePackageChange = (packageType, field, value) => {
        switch (packageType) {
            case 'basic':
                setBasicPackage({ ...basicPackage, [field]: field === 'includes' ? value.split('\n') : value });
                break;
            case 'premium':
                setPremiumPackage({ ...premiumPackage, [field]: field === 'includes' ? value.split('\n') : value });
                break;
            case 'luxury':
                setLuxuryPackage({ ...luxuryPackage, [field]: field === 'includes' ? value.split('\n') : value });
                break;
            default:
                break;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Update Service</h1>
                <Link
                    to="/provider-profile"
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                    Cancel
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    
                    {/* Service Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Service Name</label>
                        <input
                            type="text"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="4"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Service Image</label>
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Service"
                                className="w-32 h-32 object-cover rounded-lg mb-2"
                            />
                        )}
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* Availability Toggle */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Availability</label>
                        <div className="mt-2">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isAvailable}
                                    onChange={(e) => setIsAvailable(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-gray-700">Service is currently available</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Packages Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Service Packages</h2>
                    
                    {/* Basic Package */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Basic Package</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    value={basicPackage.price}
                                    onChange={(e) => handlePackageChange('basic', 'price', e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={basicPackage.duration}
                                    onChange={(e) => handlePackageChange('basic', 'duration', e.target.value)}
                                    required
                                    min="15"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            {/* <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={basicPackage.description}
                                    onChange={(e) => handlePackageChange('basic', 'description', e.target.value)}
                                    required
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div> */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Includes (one item per line)</label>
                                <textarea
                                    value={basicPackage.includes.join('\n')}
                                    onChange={(e) => handlePackageChange('basic', 'includes', e.target.value)}
                                    required
                                    rows="4"
                                    placeholder="Enter included services, one per line"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Premium Package */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Premium Package</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    value={premiumPackage.price}
                                    onChange={(e) => handlePackageChange('premium', 'price', e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={premiumPackage.duration}
                                    onChange={(e) => handlePackageChange('premium', 'duration', e.target.value)}
                                    required
                                    min="15"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            {/* <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={premiumPackage.description}
                                    onChange={(e) => handlePackageChange('premium', 'description', e.target.value)}
                                    required
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div> */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Includes (one item per line)</label>
                                <textarea
                                    value={premiumPackage.includes.join('\n')}
                                    onChange={(e) => handlePackageChange('premium', 'includes', e.target.value)}
                                    required
                                    rows="4"
                                    placeholder="Enter included services, one per line"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Luxury Package */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Luxury Package</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    value={luxuryPackage.price}
                                    onChange={(e) => handlePackageChange('luxury', 'price', e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={luxuryPackage.duration}
                                    onChange={(e) => handlePackageChange('luxury', 'duration', e.target.value)}
                                    required
                                    min="15"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                            {/* <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={luxuryPackage.description}
                                    onChange={(e) => handlePackageChange('luxury', 'description', e.target.value)}
                                    required
                                    rows="2"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div> */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Includes (one item per line)</label>
                                <textarea
                                    value={luxuryPackage.includes.join('\n')}
                                    onChange={(e) => handlePackageChange('luxury', 'includes', e.target.value)}
                                    required
                                    rows="4"
                                    placeholder="Enter included services, one per line"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 ">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-[#BC4626] text-white rounded-md bg-[#DFA55D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                    >
                        {isLoading ? 'Updating...' : 'Update Service'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateService;
