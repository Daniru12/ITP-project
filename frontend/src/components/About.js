import React from 'react';

function About() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <p className="text-xl mb-4">We are committed to providing eco-friendly products for a sustainable future.</p>
          <p className="text-xl mb-4">Our mission is to make a positive impact on the environment by offering high-quality, eco-friendly products that are accessible to everyone.</p>
        </div>

        <h2 className="text-3xl font-bold mb-4 text-center">Our Values</h2>
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <ul className="list-disc list-inside">
            <li className="text-xl mb-2">Sustainability: We prioritize sustainable practices in all aspects of our business.</li>
            <li className="text-xl mb-2">Quality: We ensure that our products meet the highest quality standards.</li>
            <li className="text-xl mb-2">Community: We believe in giving back to the community and supporting local initiatives.</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mb-4 text-center">Our History</h2>
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <p className="text-xl mb-4">Founded in 2020, EcoShop started with a vision to provide eco-friendly alternatives to everyday products. Our journey began with a small team of passionate individuals dedicated to making a difference.</p>
        </div>

        <h2 className="text-3xl font-bold mb-4 text-center">Meet Our Team</h2>
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <p className="text-xl mb-4">Our team is composed of experts in sustainability, product development, and customer service, all working together to bring you the best eco-friendly products.</p>
        </div>
      </div>
    </section>
  );
}

export default About;