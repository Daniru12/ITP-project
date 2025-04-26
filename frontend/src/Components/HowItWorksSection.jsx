import React from 'react'
import { Search, Calendar, Heart, CheckCircle } from 'lucide-react'

export const HowItWorksSection = () => {
  const sectionStyle = {
    backgroundColor: 'var(--color-accent-light)',
  };

  const steps = [
    {
      icon: <Search size={28} style={{ color: 'var(--color-primary)' }} />,
      title: 'Search',
      description:
        'Browse our network of verified pet care providers and services in your area.',
    },
    {
      icon: <Calendar size={28} style={{ color: 'var(--color-secondary)' }} />,
      title: 'Book',
      description:
        'Schedule and book services directly through our secure platform.',
    },
    {
      icon: <Heart size={28} style={{ color: 'var(--color-primary)' }} />,
      title: 'Enjoy',
      description:
        'Relax knowing your pet is receiving the best care from trusted professionals.',
    },
    {
      icon: <CheckCircle size={28} style={{ color: 'var(--color-accent)' }} />,
      title: 'Review',
      description:
        'Share your experience and help other pet parents find great service.',
    },
  ]

  return (
    <section id="how-it-works" className="py-16" style={sectionStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--color-primary)' }}>
            How Pawgo Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Finding quality pet care has never been easier
          </p>
        </div>
        <div className="mt-16">
          <div className="relative">
            {/* Connection line */}
            <div
              className="hidden md:block absolute top-1/2 w-full h-0.5"
              style={{ backgroundColor: 'var(--color-accent-light)' }}
              aria-hidden="true"
            ></div>
            {/* Steps */}
            <div className="relative grid gap-6 md:grid-cols-4">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                      style={{ backgroundColor: 'white', boxShadow: '0 0 0 4px var(--color-accent-light)' }}
                    >
                      {step.icon}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-medium" style={{ color: 'var(--color-primary)' }}>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 flex justify-center">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white hover:opacity-90 transition-all duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Get Started Today
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
