import React from 'react';

function Newsletter() {
  return (
    <section className="bg-gray-200 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
        <p className="text-xl mb-8">Stay updated with our latest products and offers</p>
        <form className="max-w-md mx-auto flex">
          <input type="email" placeholder="Enter your email" className="flex-grow py-2 px-4 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-600" />
          <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-r-full hover:bg-blue-700 transition duration-300">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;

