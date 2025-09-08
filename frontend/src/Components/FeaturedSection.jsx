import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

const FeaturedSection = () => {
  // State to store featured providers and products
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProviders = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        // Fetch all services to get provider details
        const response = await axios.get(`${backendUrl}/api/users/services`);
        
        // Process and format the services data
        const processedProviders = response.data.services
          // Group services by provider
          .reduce((acc, service) => {
            const providerId = service.provider_id._id;
            if (!acc[providerId]) {
              acc[providerId] = {
                id: providerId,
                name: service.provider_id.full_name,
                image: service.provider_id.profile_picture || 'https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?t=st=1745931716~exp=1745935316~hmac=1020c145ddd9dffabf79f1a03646eb0447025bfcaed911167f4b616add4137ba&w=740',
                service: service.service_category.replace('_', ' '),
                unit: service.service_category === 'pet_boarding' ? 'night' : 'session',
                location: service.location,
                rating: 4.5, // You can add actual rating logic here
              };
            }
            return acc;
          }, {});

        // Convert to array and take first 3 providers
        setFeaturedProviders(Object.values(processedProviders).slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured providers:', error);
        setError('Failed to load featured providers');
        setLoading(false);
      }
    };

    fetchFeaturedProviders();
  }, []);

  const featuredProducts = [
    {
      name: 'Premium Dog Food',
      image:
        'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Interactive Cat Toy',
      image:
        'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',

    },
    {
      name: 'Cozy Pet Bed',
      image:
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',

    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Providers */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                Featured Service Providers
              </h2>
              <p className="mt-2 text-gray-600">
                Top-rated professionals in your area
              </p>
            </div>
          </div>
          
          {loading ? (
            // Loading state
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-48"></div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center text-red-500 py-8">
              {error}
            </div>
          ) : (
            // Display providers
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProviders.map((provider, index) => (
                <div
                  key={provider.id}
                  className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header with Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-20">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{provider.rating}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Provider Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors">
                          {provider.name}
                        </h3>
                        <p className="text-accent font-medium mt-1 capitalize">
                          {provider.service}
                        </p>
                      </div>

                      {/* Location and Details */}
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{provider.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">Available per {provider.unit}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
