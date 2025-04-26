import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from "react-hot-toast";
import axios from 'axios';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await axios.post(`${backendUrl}/api/users/login`, formData);
            
            const { user, token } = response.data;
            localStorage.setItem("token", token);

            // Show success message with user's name if available
            toast.success(`Welcome${user.full_name ? ` ${user.full_name}` : ''}!`);

            // Navigate based on user type
            switch(user.user_type) {
                case "admin":
                    navigate("/admin");
                    break;
                case "service_provider":
                    navigate("/provider-profile");
                    break;
                default:
                    navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Section - Image and Text */}
            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-white p-12">
                <div className="w-full max-w-md">
                    <img 
                        src="https://img.freepik.com/free-photo/group-portrait-adorable-puppies_53876-64778.jpg" 
                        alt="Pet Care Illustration" 
                        className="w-full h-auto rounded-lg shadow-md mb-8"
                    />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Welcome to PawCare
                    </h2>
                    <p className="text-gray-600">
                        Your trusted platform for all pet care needs. Connect with professional service providers and ensure the best care for your furry friends.
                    </p>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Sign In
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Welcome back! Please enter your details
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            {/* Remember me and Forgot password */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-accent)] border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-primary)]">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-on-primary)] bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>

                            {/* Register Link */}
                            <div className="text-center mt-4">
                                <span className="text-gray-600">Don't have an account? </span>
                                <Link to="/register" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-primary)]">
                                    Register here
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

