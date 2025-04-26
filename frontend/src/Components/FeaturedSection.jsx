import React from 'react';
import { Star } from 'lucide-react';

const FeaturedSection = () => {
  const featuredProviders = [
    {
      name: "Sarah's Pet Paradise",
      image:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      service: 'Pet Boarding',
      rating: 4.9,
      reviews: 124,
      price: '$45',
      unit: 'night',
    },
    {
      name: 'Glamour Paws',
      image:
        'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      service: 'Pet Grooming',
      rating: 4.8,
      reviews: 89,
      price: '$60',
      unit: 'session',
    },
    {
      name: 'Master Trainers',
      image:
        'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      service: 'Pet Training',
      rating: 4.9,
      reviews: 156,
      price: '$75',
      unit: 'session',
    },
  ];

  const featuredProducts = [
    {
      name: 'Premium Dog Food',
      image:
        'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      rating: 4.7,
      reviews: 213,
      price: '$39.99',
    },
    {
      name: 'Interactive Cat Toy',
      image:
        'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      rating: 4.6,
      reviews: 87,
      price: '$24.99',
    },
    {
      name: 'Cozy Pet Bed',
      image:
        'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
      rating: 4.8,
      reviews: 142,
      price: '$59.99',
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
            <a 
              href="#" 
              style={{ color: 'var(--color-primary)' }}
              className="font-medium hover:opacity-80 transition-colors duration-300"
            >
              View all
            </a>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProviders.map((provider, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {provider.name}
                      </h3>
                      <p style={{ color: 'var(--color-accent)' }}>{provider.service}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Star size={18} style={{ color: 'var(--color-secondary)', fill: 'var(--color-secondary)' }} />
                    <span className="ml-1 text-gray-700 font-medium">{provider.rating}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-500">{provider.reviews} reviews</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{provider.price}</span>
                    <span className="text-gray-600">/{provider.unit}</span>
                    <a 
                      href="#" 
                      style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                      className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-all duration-300"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
