import React from 'react';

function Hero() {
  return (
    <section className="bg-gray-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to EcoShop</h1>
        <p className="text-xl mb-8">Discover eco-friendly products for a sustainable lifestyle</p>
        <a href="/products" className="bg-white text-blue-600 py-2 px-6 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">
          Shop Now
        </a>
      </div>
    </section>
  );
}

export default Hero;

