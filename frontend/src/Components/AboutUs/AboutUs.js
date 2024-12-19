import React from 'react'
import './AboutUs.css';
import aboutImage from './about.jpg';

function AboutUs() {
  return (
    <div>
      <div className="about-us-container">
        <header className="about-header">
          <h1>About Us</h1>
          <p>Learn more about our mission and team.</p>
        </header>

        <section className="about-content">
          <div className="about-image">
            <img src={aboutImage} alt="Team" />
          </div>
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>We are dedicated to delivering fresh, fast, and quality food to our customers. Our goal is to make food delivery a seamless and enjoyable experience for everyone.</p>

            <h2>Our Team</h2>
            <p>We have a passionate team of professionals who work tirelessly to bring the best food and service to your doorstep. We believe in innovation, quality, and customer satisfaction.</p>

            <h2>Our Values</h2>
            <ul>
              <li>Quality: We ensure the best quality in all our products.</li>
              <li>Innovation: We always look for ways to improve our service.</li>
              <li>Customer Satisfaction: Our customers are our top priority.</li>
            </ul>
          </div>
        </section>

        <footer className="about-footer">
                <p>&copy; 2024 Fresh Food Delivery. All Rights Reserved.</p>
                <p className="designer">@Designed by Daniru Punsith</p>
            </footer>
      </div>
    </div>
  )
}

export default AboutUs