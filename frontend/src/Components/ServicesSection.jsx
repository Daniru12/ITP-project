import React from 'react'
import {
  HomeIcon,
  ScissorsIcon,
  GraduationCapIcon,
  ShoppingBagIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export const ServicesSection = () => {
  const services = [
    {
      title: 'Pet Boarding',
      description:
        "Safe and comfortable accommodations for your pets when you're away. Our verified hosts provide loving care in their homes or yours.",
      icon: <HomeIcon size={32} style={{ color: 'var(--color-primary)' }} />,
      image:
        'https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Pet Grooming',
      description:
        'Professional grooming services to keep your pet clean, healthy, and looking their best. From baths to haircuts and nail trims.',
      icon: <ScissorsIcon size={32} style={{ color: 'var(--color-accent)' }} />,
      image:
        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Pet Training',
      description:
        'Expert trainers to help with obedience training, behavior modification, and specialized skills for pets of all ages.',
      icon: <GraduationCapIcon size={32} style={{ color: 'var(--color-secondary)' }} />,
      image:
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Pet Products',
      description:
        'Quality food, toys, accessories, and more for all your pet needs. Curated selection of trusted brands and innovative products.',
      icon: <ShoppingBagIcon size={32} style={{ color: 'var(--color-primary)' }} />,
      image:
        'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    },
  ]
  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--color-accent)' }}>
            Our Premium Pet Services
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Everything your furry friend needs, all in one place
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 border border-gray-100"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
                <Link
                  to="/display-services"
                  className="mt-4 inline-flex items-center font-medium hover:opacity-80 transition-colors duration-300"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Learn more
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
