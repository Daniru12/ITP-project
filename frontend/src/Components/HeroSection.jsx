import React from 'react'
import { SearchIcon, ArrowRight } from 'lucide-react'
import RotatingText from '../UI/RotateText'
import { motion } from 'framer-motion'

export const HeroSection = () => {
  const gradientStyle = {
    background: `linear-gradient(135deg, var(--color-accent-light) 0%, rgba(255,255,255,0.95) 100%)`,
    position: 'relative',
    overflow: 'hidden',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 md:py-28 relative" style={gradientStyle}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full filter blur-3xl opacity-30 -z-10"></div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2 lg:pr-10"
            variants={itemVariants}
          >
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-0">
                The Smart Way to
              </h1>
              <div className="h-9 mt-0">
                <RotatingText
                  texts={['Care for Pets', 'Groom Your Pet', 'Train Your Pet', 'Board Your Pet']}
                  mainClassName="text-5xl md:text-6xl font-bold leading-tight"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                  elementLevelClassName="text-[#BC4626] bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
                />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight ">
                Your Furry Friends
              </h1>
            </div>

            <motion.p 
              className="mt-6 text-xl text-gray-600 max-w-lg leading-relaxed"
              variants={itemVariants}
            >
              Connect with trusted pet care professionals for boarding,
              grooming, training, and shop quality pet products - all in one
              place.
            </motion.p>

            <motion.div 
              className="mt-8 flex flex-wrap items-center gap-4 text-sm text-gray-600"
              variants={itemVariants}
            >
              {[
                { text: 'Verified Professionals', icon: '👨‍⚕️' },
                { text: 'Secure Booking', icon: '🔒' },
                { text: '24/7 Support', icon: '💬' }
              ].map((item, index) => (
                <div key={index} className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2"
            variants={itemVariants}
          >
            <div className="relative">
              <motion.div 
                className="absolute -top-6 -left-6 w-32 h-32 rounded-full opacity-50"
                style={{ backgroundColor: 'var(--color-secondary)' }}
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Happy dogs with their owner"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover h-[500px] hover:scale-[1.02] transition-transform duration-300"
                whileHover={{ scale: 1.02 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div 
                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
