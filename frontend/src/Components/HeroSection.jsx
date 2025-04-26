import React from 'react'
import { SearchIcon } from 'lucide-react'
import RotatingText from '../UI/RotateText'

export const HeroSection = () => {
  const gradientStyle = {
    background: `linear-gradient(135deg, var(--color-accent-light) 0%, rgba(255,255,255,0.9) 100%)`,
  };

  return (
    <section className="py-16 md:py-24" style={gradientStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              The Smart Way to
            </h1>
            <div>
              <RotatingText
                texts={['Care for Pets', 'Groom Your Pet', 'Train Your Pet', 'Board Your Pet']}
                mainClassName="text-4xl md:text-5xl font-bold leading-tight mb-2"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
                elementLevelClassName="text-[#BC4626]"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Your Furry Friends
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-lg">
              Connect with trusted pet care professionals for boarding,
              grooming, training, and shop quality pet products - all in one
              place.
            </p>
            <div className="mt-8 bg-white p-3 rounded-lg shadow-md max-w-md">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-grow mb-2 sm:mb-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for pet services near you..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        focusRing: 'var(--color-accent)',
                        borderColor: 'var(--color-accent)'
                      }}
                    />
                  </div>
                </div>
                <button 
                  className="px-6 py-2 rounded-md font-medium sm:ml-2 text-white transition-all duration-300 hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="mt-8 flex items-center text-sm text-gray-600">
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified Professionals
              </span>
              <span className="mx-4">•</span>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure Booking
              </span>
              <span className="mx-4">•</span>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                24/7 Support
              </span>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0">
            <div className="relative">
              <div style={{ backgroundColor: 'var(--color-secondary)' }} className="absolute -top-6 -left-6 w-32 h-32 rounded-full opacity-50"></div>
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Happy dogs with their owner"
                className="relative z-10 rounded-lg shadow-xl w-full object-cover h-80 md:h-96"
              />
              <div style={{ backgroundColor: 'var(--color-primary)' }} className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
