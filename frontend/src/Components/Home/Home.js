import React from 'react'
import './Home.css';
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="content">
          <h1>Best food for <br></br>Your taste</h1>
          <p>Experience the best of our services and food.</p>
          <button><Link to="/food" className='link'>Order</Link></button>
        </div>
        
      </section>
    </div>
  )
}

export default Home