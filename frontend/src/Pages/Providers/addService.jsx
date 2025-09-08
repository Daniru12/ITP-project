import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const AddService = () => {
  const navigate = useNavigate();

  const serviceTypes = [
    {
      id: "grooming",
      name: "Grooming Service",
      path: "/add-grooming",
      description: "Add pet grooming services like bathing, haircuts, and nail trimming",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
      icon: "✂️",
      features: ["Bathing", "Haircuts", "Nail Trimming", "Ear Cleaning"]
    },
    {
      id: "boarding",
      name: "Boarding Service",
      path: "/add-boarding",
      description: "Add pet boarding and daycare services",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      icon: "🏠",
      features: ["Overnight Stay", "Daycare", "Play Areas", "24/7 Supervision"]
    },
    {
      id: "training",
      name: "Training Service",
      path: "/add-training",
      description: "Add pet training and behavior modification services",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      icon: "🎓",
      features: ["Basic Commands", "Behavior Training", "Agility Training", "Puppy Classes"]
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-secondary-light)]">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-on-secondary)] mb-4">
                Add New Services
              </h1>
              <p className="text-lg text-[var(--text-on-secondary)] opacity-80">
                Choose the type of service you want to offer
              </p>
            </div>
            <Link
              to="/provider-profile"
              className="flex items-center text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceTypes.map((service) => (
            <div
              key={service.id}
              className="group relative bg-[var(--color-white)] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              {/* Service Icon */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-[var(--color-primary)] text-[var(--text-on-primary)] w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                  {service.icon}
                </div>
              </div>

              {/* Image Section */}
              <div className="relative h-48">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div/>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[var(--text-on-secondary)] mb-3">
                  {service.name}
                </h3>
                <p className="text-[var(--text-on-secondary)] opacity-80 mb-4">
                  {service.description}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {service.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-[var(--text-on-secondary)] bg-[var(--color-secondary-light)] p-2 rounded-lg"
                    >
                      <svg className="w-4 h-4 text-[var(--color-accent)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Link
                  to={service.path}
                  className="block w-full bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-[var(--text-on-primary)] py-3 px-6 rounded-lg transition-colors duration-300 text-center"
                >
                  Add Service
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-[var(--color-white)] rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-[var(--color-accent-light)] p-4 rounded-xl">
              <svg className="w-8 h-8 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-semibold text-[var(--text-on-secondary)] mb-3">Need Help?</h4>
              <p className="text-[var(--text-on-secondary)] opacity-80">
                Each service type has its own specific form with relevant fields and options. 
                Our platform makes it easy to add and manage your services. If you need any assistance, 
                feel free to contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddService;
