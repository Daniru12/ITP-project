import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';
import illustration from './illustration.png';
import { Link } from "react-router-dom";

function Login() {
    const history = useNavigate();
    const [user, setUser] = useState({
        gmail: "",
        password: ""  // Add password field here
    });

    // Handle input change
    const handleinputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    // Function to send login request
    const sendRequest = async () => {
        try {
            return await axios.post("http://localhost:5000/users/login", {
                gmail: user.gmail,
                password: user.password,
            });
        } catch (error) {
            throw new Error("Login failed");
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await sendRequest();
            // Check the response and adjust accordingly
            if (response.data.status === "ok") {  // assuming your server sends this back
                alert("Login success");
                history("/get");
            } else {
                alert("Login failed");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className='container'>
            <div class="login-form">
                <h2>Login</h2>
                <p>Don't have an account yet? <Link to="/reg">Sign Up</Link></p>
                <form onSubmit={handleSubmit}>


                    <label>Email Address</label>
                    <input
                        type="email"

                        id="gmail"
                        onChange={handleinputChange}
                        name="gmail"
                        value={user.gmail}
                        placeholder="you@example.com"
                        required
                    />



                    <label>Password</label>
                    <input
                        type="password"

                        id="password"
                        onChange={handleinputChange}
                        name="password"
                        value={user.password}  // Use the correct value binding
                        placeholder="Enter 6 characters or more"
                        required
                    />

                    <div class="options">
                        <label><input type="checkbox" /> Remember me</label>
                        <a href="#" class="forgot-password">Forgot Password?</a>
                    </div>
                    <button type="submit" class="login-btn">LOGIN</button>
                </form>
                <p class="or">or login with</p>
                <div class="social-login">
                    <button class="google-btn">Google</button>
                    <button class="facebook-btn">Facebook</button>
                </div>
            </div>
            <div class="illustration">
                <img src={illustration} alt="Illustration" />
            </div>
        </div>
    );
}

export default Login;
