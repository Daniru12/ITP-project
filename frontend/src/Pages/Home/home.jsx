import React from 'react'
import SplashCursor from '../../UI/SplashCursor'
import { HeroSection } from '../../Components/HeroSection'
import { ServicesSection } from '../../Components/ServicesSection'
import { HowItWorksSection } from '../../Components/HowItWorksSection'
import FeaturedSection from '../../Components/FeaturedSection'
import { TestimonialsSection } from '../../Components/TestimonialsSection'
import CTASection from '../../Components/CTASection'
import { Footer } from '../../Components/Footer'
import HomePageAdShow from '../../Components/HomePageAdShow '


function home() {
  return (
    <>
    <div className="min-h-screen bg-white">
      <main>
        <HeroSection />
        <HomePageAdShow/>
        <ServicesSection />
        <HowItWorksSection />
        <FeaturedSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
    </>


    
  )
}

export default home
