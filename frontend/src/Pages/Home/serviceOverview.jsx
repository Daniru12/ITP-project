import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaStar, FaUser, FaCheck } from 'react-icons/fa'
import '../../App.css'

const ServiceOverview = () => {
    const { id } = useParams()
    const [service, setService] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/service/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setService(res.data.service)
            setIsLoading(false)
        })
        .catch(err => {
            setError(err.message)
            setIsLoading(false)
        })
    }, [id])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster">
                    <div className="wheel"></div>
                    <div className="hamster">
                        <div className="hamster__body">
                            <div className="hamster__head">
                                <div className="hamster__ear"></div>
                                <div className="hamster__eye"></div>
                                <div className="hamster__nose"></div>
                            </div>
                            <div className="hamster__limb hamster__limb--fr"></div>
                            <div className="hamster__limb hamster__limb--fl"></div>
                            <div className="hamster__limb hamster__limb--br"></div>
                            <div className="hamster__limb hamster__limb--bl"></div>
                            <div className="hamster__tail"></div>
                        </div>
                    </div>
                    <div className="spoke"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Service not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link
                    to="/display-services"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Services
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Images and Provider Info */}
                    <div className="lg:col-span-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-8">
                            <div className="h-[400px] relative">
                                <img
                                    src={service.image?.[selectedImage] || "https://via.placeholder.com/800x400?text=Pet+Service"}
                                    alt={service.service_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {service.image && service.image.length > 1 && (
                                <div className="flex gap-3 p-4 overflow-x-auto">
                                    {service.image.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 ${selectedImage === index ? 'ring-2 ring-blue-500' : ''}`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${service.service_name} ${index + 1}`}
                                                className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Service Description */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
                            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-accent)' }}>About This Service</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>
                        </div>

                        {/* Provider Information */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <FaUser className="w-6 h-6 mr-3" style={{ color: 'var(--color-accent)' }} />
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Service Provider</h2>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-grow">
                                    <h3 className="text-xl font-semibold mb-2">{service.provider_id?.full_name || 'Anonymous'}</h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FaMapMarkerAlt className="mr-2" />
                                        <span>{service.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <FaStar className="mr-2 text-yellow-400" />
                                        <span>4.8 (120 reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Packages and Booking */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Service Header */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full capitalize mb-4 inline-block">
                                {service.service_category.replace('_', ' ')}
                            </span>
                            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                                {service.service_name}
                            </h1>
                        </div>

                        {/* Packages */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-accent)' }}>Service Packages</h2>
                            <div className="space-y-4">
                                {service.packages && Object.entries(service.packages).map(([tier, package_]) => (
                                    <div 
                                        key={tier}
                                        className="bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-semibold capitalize">{tier}</h3>
                                            <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                                Rs. {package_?.price || 'N/A'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-600 mb-4">
                                            <FaClock className="mr-2" />
                                            <span>{package_?.duration} minutes</span>
                                        </div>

                                        {package_?.includes && (
                                            <div className="space-y-2">
                                                {package_?.includes.map((item, index) => (
                                                    <div key={index} className="flex items-center text-gray-600">
                                                        <FaCheck className="mr-2 text-green-500" />
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Link
                                to={`/Appointmentadd/${service._id}`}
                                className="block text-center px-6 py-3 rounded-full text-white transition-all duration-300 hover:shadow-md w-full"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                Book Appointment
                            </Link>
                            
                            <Link
                                to={`/reviews/${service._id}`}
                                className="block text-center px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-700 transition-all duration-300 hover:shadow-md w-full"
                            >
                                Write a Review
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceOverview
