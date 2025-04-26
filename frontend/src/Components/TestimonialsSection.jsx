import React from 'react'
import { Star } from 'lucide-react'

export const TestimonialsSection = () => {
  const sectionStyle = {
    backgroundColor: 'var(--color-accent-light)',
  };

  const testimonials = [
    {
      content:
        'Pawgo has been a lifesaver! I travel frequently for work and their boarding service gives me peace of mind knowing my dog is in good hands.',
      author: 'Jessica T.',
      location: 'San Francisco, CA',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      pet: 'Golden Retriever',
      service: 'Pet Boarding',
      rating: 5,
    },
    {
      content:
        'The groomers on Pawgo are true professionals. My poodle has never looked better, and the booking process was so simple!',
      author: 'Michael R.',
      location: 'Chicago, IL',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      pet: 'Poodle',
      service: 'Pet Grooming',
      rating: 5,
    },
    {
      content:
        'After just a few training sessions booked through Pawgo, my formerly unruly puppy is now so well-behaved! Worth every penny.',
      author: 'Samantha K.',
      location: 'Austin, TX',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      pet: 'Labrador Puppy',
      service: 'Pet Training',
      rating: 4,
    },
  ]

  return (
    <section className="py-16" style={sectionStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--color-primary)' }}>
            What Pet Parents Are Saying
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Join thousands of happy customers who trust Pawgo with their furry
            family members
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 relative border border-gray-100"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-6" style={{ color: 'var(--color-accent-light)' }}>
                <svg
                  width="45"
                  height="36"
                  viewBox="0 0 45 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.5 0C6.04 0 0 6.04 0 13.5C0 20.96 6.04 27 13.5 27C20.96 27 27 20.96 27 13.5L27 9C27 4.02 22.98 0 18 0H13.5ZM31.5 0C24.04 0 18 6.04 18 13.5C18 20.96 24.04 27 31.5 27C38.96 27 45 20.96 45 13.5L45 9C45 4.02 40.98 0 36 0H31.5Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    style={{ 
                      color: i < testimonial.rating ? 'var(--color-secondary)' : '#E5E7EB',
                      fill: i < testimonial.rating ? 'var(--color-secondary)' : '#E5E7EB'
                    }}
                  />
                ))}
              </div>
              {/* Content */}
              <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
              {/* Author info */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {testimonial.author}
                  </h4>
                  <div className="text-sm text-gray-600">
                    {testimonial.location}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-accent)' }}>
                    {testimonial.service} for {testimonial.pet}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center font-medium hover:opacity-80 transition-colors duration-300"
            style={{ color: 'var(--color-primary)' }}
          >
            Read more testimonials
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
          </a>
        </div>
      </div>
    </section>
  )
}
