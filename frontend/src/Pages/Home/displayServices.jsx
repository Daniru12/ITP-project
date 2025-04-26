import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaFilter } from 'react-icons/fa'
import '../../App.css'

const DisplayServices = () => {
    const [services, setServices] = useState([])
    const [filteredServices, setFilteredServices] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const token = localStorage.getItem('token')

    // Get unique categories from services
    const categories = ['all', ...new Set(services.map(service => 
        service.service_category.toLowerCase().replace('_', ' ')
    ))]

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/services`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setServices(res.data.services)
            setFilteredServices(res.data.services)
            setIsLoading(false)
        })
        .catch(err => {
            setError(err.message)
            setIsLoading(false)
        })
    }, [])

    // Filter services based on search term and category
    useEffect(() => {
        let result = services
        
        if (searchTerm) {
            result = result.filter(service =>
                service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        
        if (selectedCategory !== 'all') {
            result = result.filter(service =>
                service.service_category.toLowerCase().replace('_', ' ') === selectedCategory
            )
        }
        
        setFilteredServices(result)
    }, [searchTerm, selectedCategory, services])

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-accent)' }}>Pet Care Services</h1>
                <p className="text-lg text-gray-600 mb-8">Find the perfect grooming service for your beloved pet</p>

                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-8">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                            style={{ 
                                focusRing: 'var(--color-accent)',
                                backgroundColor: 'white' 
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <FaFilter className="text-gray-400" />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none bg-white transition-all capitalize"
                            style={{ focusRing: 'var(--color-accent)' }}
                        >
                            {categories.map(category => (
                                <option key={category} value={category} className="capitalize">
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                    <div key={service._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                        {/* Service Image */}
                        <div className="h-56 overflow-hidden">
                            <img
                                src={service.image?.[0] || "https://via.placeholder.com/400x300?text=Pet+Service"}
                                alt={service.service_name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>

                        {/* Service Details */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                                    {service.service_name}
                                </h2>
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full capitalize">
                                    {service.service_category.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                            
                            {/* Provider Info */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <div>
                                        <p className="font-medium text-gray-900">{service.provider_id?.full_name || 'Anonymous'}</p>
                                        <p className="text-xs">{service.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Packages */}
                            <div className="space-y-2">
                                {service.packages && Object.entries(service.packages || {}).map(([tier, package_]) => (
                                    <div key={tier} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2">
                                        <span className="capitalize font-medium">{tier}</span>
                                        <span className="font-semibold">Rs. {package_?.price || 'N/A'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* View Details Button */}
                            <Link
                                to={`/service-overview/${service._id}`}
                                className="mt-6 block text-center px-6 py-2.5 rounded-full text-white transition-all duration-300 hover:shadow-md"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Services Message */}
            {filteredServices.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <FaSearch className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-xl text-gray-600 mb-2">No services found</p>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
            )}
        </div>
    )
}

export default DisplayServices
