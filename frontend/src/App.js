import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

//test
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Hero />
      <FeaturedProducts />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default App;

