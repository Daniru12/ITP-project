import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css'
import { Link } from "react-router-dom";
import illustration from './illustration.png';

function Register() {
  const history = useNavigate();
  const [user, setUser] = useState({
    name: "",
    gmail: "",
    password: ""
  });

  // Handle input change
  const handleinputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  // Function to send registration request
  const sendRequest = async () => {
    try {
      await axios.post("http://localhost:5000/users/register", {
        name: String(user.name),
        gmail: String(user.gmail),
        password: String(user.password),
      });
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendRequest();
      alert("Registered Successfully");
      history("/get");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className='container'>
      <div className="form-container">
        <h2>Sign Up</h2>
        <p>Already have an account? <Link to="/log" >Login</Link></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              onChange={handleinputChange}
              name="name"
              value={user.name}
              placeholder="Enter Name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gmail">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="gmail"
              onChange={handleinputChange}
              name="gmail"
              value={user.gmail}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              onChange={handleinputChange}
              name="password"
              value={user.password}
              placeholder="Enter Password"
            />
          </div>

          <button type="submit" className="register-btn">Register</button>
        </form>
      </div>
      <div className="illustration">
        <img src={illustration} alt="Illustration" />
      </div>
    </div>
  );
}

export default Register;
