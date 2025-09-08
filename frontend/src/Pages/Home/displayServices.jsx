import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaFilter, FaPaw, FaMapMarkerAlt, FaUser } from 'react-icons/fa'
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-xl text-red-600 p-8 bg-white rounded-lg shadow-md border border-red-100">
                    <FaPaw className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p>Error: {error}</p>
                    <p className="text-sm text-gray-500 mt-2">Please try again later</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
            {/* Header Section with paw print accents */}
            <div className="max-w-7xl mx-auto text-center mb-16 relative">
                <div className="absolute -top-10 left-1/4 text-gray-100 opacity-30 transform -rotate-12">
                    <FaPaw size={40} />
                </div>
                <div className="absolute top-0 right-1/4 text-gray-100 opacity-30 transform rotate-12">
                    <FaPaw size={30} />
                </div>
                
                <h1 className="text-5xl font-bold mb-4 relative inline-block" style={{ color: 'var(--color-accent)' }}>
                    Pet Care Services
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></div>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Find the perfect grooming service for your beloved pet
                </p>

                {/* Search and Filter Section with enhanced styling */}
                <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-12 z-10 relative">
                    {/* Search Input */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-500 transition-colors">
                            <FaSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all bg-white"
                            style={{ 
                                focusRing: 'var(--color-accent)',
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative min-w-[220px] group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-hover:text-gray-500 transition-colors">
                            <FaFilter />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none bg-white transition-all capitalize cursor-pointer"
                            style={{ focusRing: 'var(--color-accent)' }}
                        >
                            {categories.map(category => (
                                <option key={category} value={category} className="capitalize">
                                    {category}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Service count indicator */}
                <div className="text-sm text-gray-500 mb-4">
                    Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
                    {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
                    {searchTerm && ` matching "${searchTerm}"`}
                </div>
            </div>

            {/* Services Grid with improved card design */}
            <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                    <div 
                        key={service._id} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] group"
                    >
                        {/* Service Image with overlay */}
                        <div className="h-60 overflow-hidden relative">
                            <img
                                src={service.image?.[0] || "https://via.placeholder.com/400x300?text=Pet+Service"}
                                alt={service.service_name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span 
                                        className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white" 
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        {service.service_category.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold transition-colors duration-300" style={{ color: 'var(--color-primary)' }}>
                                    {service.service_name}
                                </h2>
                                <span 
                                    className="text-xs px-3 py-1 rounded-full capitalize font-medium"
                                    style={{ 
                                        backgroundColor: 'var(--color-accent)', 
                                        color: '#fff',
                                        opacity: 0.9
                                    }}
                                >
                                    {service.service_category.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                            
                            {/* Provider Info with enhanced layout */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                                <div className="flex items-center text-sm text-gray-500">
                                    <div className="mr-3 flex-shrink-0 bg-gray-200 p-2 rounded-full">
                                        <FaUser className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{service.provider_id?.full_name || 'Anonymous'}</p>
                                        <div className="flex items-center text-xs mt-1">
                                            <FaMapMarkerAlt className="mr-1 text-gray-400" />
                                            <span>{service.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Packages section with minimalistic design */}
                            <div className="space-y-3 mb-6 mt-5 border-t border-gray-100 pt-4">
                                <div className="flex items-center mb-3">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                                        Available Packages
                                    </span>
                                    <div className="h-px flex-grow ml-3 bg-gray-100"></div>
                                </div>
                                
                                {service.packages && Object.entries(service.packages || {}).map(([tier, package_], index) => (
                                    <div 
                                        key={tier} 
                                        className="flex justify-between items-center text-sm p-3 transition-all hover:bg-gray-50 border border-gray-100 rounded-lg"
                                    >
                                        <div className="flex items-center">
                                            <span className="capitalize text-gray-600">{tier}</span>
                                        </div>
                                        <span className="font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-md">
                                            Rs. {package_?.price || 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* View Details Button with animation */}
                            <Link
                                to={`/service-overview/${service._id}`}
                                className="mt-6 block text-center px-6 py-3 rounded-full text-white transition-all duration-300 hover:shadow-md relative overflow-hidden group"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                <span className="relative z-10">View Details</span>
                                <span 
                                    className="absolute inset-0 w-full h-full transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left"
                                    style={{ backgroundColor: 'var(--color-accent)' }}
                                ></span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Services Message with better styling */}
            {filteredServices.length === 0 && (
                <div className="text-center py-16 max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="inline-flex items-center justify-center p-4 rounded-full mb-4" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                        <FaSearch className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <p className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>No services found</p>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    
                    <button 
                        onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}
                        className="mt-6 px-4 py-2 rounded-full text-sm inline-flex items-center transition-all"
                        style={{ color: 'var(--color-accent)' }}
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset filters
                    </button>
                </div>
            )}
            
            {/* Footer accent */}
            <div className="max-w-7xl mx-auto mt-16 opacity-30 flex justify-center space-x-4">
                <FaPaw size={20} className="text-gray-300 transform rotate-12" />
                <FaPaw size={15} className="text-gray-300 transform -rotate-12" />
                <FaPaw size={20} className="text-gray-300 transform rotate-12" />
            </div>
        </div>
    )
}

export default DisplayServices