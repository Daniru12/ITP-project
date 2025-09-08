import React, { useEffect } from 'react'
import { motion, useAnimation, useScroll } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import SplashCursor from '../../UI/SplashCursor'
import { HeroSection } from '../../Components/HeroSection'
import { ServicesSection } from '../../Components/ServicesSection'
import { HowItWorksSection } from '../../Components/HowItWorksSection'
import FeaturedSection from '../../Components/FeaturedSection'
import { TestimonialsSection } from '../../Components/TestimonialsSection'
import CTASection from '../../Components/CTASection'
import { Footer } from '../../Components/Footer'
import HomePageAdShow from '../../Components/HomePageAdShow '

// Animation variants for sections
const sectionVariants = {
  hidden: { 
    opacity: 0,
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Component to wrap sections with animations
const AnimatedSection = ({ children }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

function Home() {
  const { scrollYProgress } = useScroll();

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-pink-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="min-h-screen bg-white">
        <main>
          {/* Hero section doesn't need animation wrapper since it has its own animations */}
          <HeroSection />

          {/* Animate other sections as they come into view */}
          <AnimatedSection>
            <HomePageAdShow />
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative">
              {/* Decorative background element */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 -z-10" />
              <ServicesSection />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative bg-gray-50">
              <HowItWorksSection />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative">
              {/* Decorative background element */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-50 -z-10" />
              <FeaturedSection />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative">
              <TestimonialsSection />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="relative">
              {/* Decorative background element */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 -z-10" />
              <CTASection />
            </div>
          </AnimatedSection>
        </main>

        <AnimatedSection>
          <Footer />
        </AnimatedSection>
      </div>
    </>
  );
}

export default Home;
