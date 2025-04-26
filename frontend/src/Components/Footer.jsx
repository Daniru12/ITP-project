import React from 'react'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export const Footer = () => {
  const footerStyle = {
    backgroundColor: '#1F2937', // Keeping dark background for footer
    borderTop: `4px solid var(--color-primary)`,
  };

  const logoStyle = {
    backgroundColor: 'var(--color-primary)',
  };

  return (
    <footer style={footerStyle} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <span style={logoStyle} className="h-8 w-8 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </span>
              <span className="ml-2 text-xl font-bold text-white">Pawgo</span>
            </div>
            <p className="mt-4 text-gray-400">
              Connecting pet parents with trusted care providers and premium
              products. Your pet's happiness is our priority.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          {/* Services */}
          <div>
            <h3 style={{ color: 'var(--color-secondary)' }} className="text-sm font-semibold tracking-wider uppercase">
              Services
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Pet Boarding
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Pet Grooming
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Pet Training
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Pet Products
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Service Pricing
                </a>
              </li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h3 style={{ color: 'var(--color-secondary)' }} className="text-sm font-semibold tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Partners
                </a>
              </li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h3 style={{ color: 'var(--color-secondary)' }} className="text-sm font-semibold tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Safety
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Pawgo. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
