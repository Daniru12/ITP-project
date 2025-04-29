import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from "react-hot-toast";
import axios from 'axios';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const formControlVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
};

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            axios.post(`${backendUrl}/api/users/login-with-google`, {   
                accessToken: codeResponse.access_token
            }).then((res) => {
                toast.success("Login successful");
                const user = res.data.user;
                localStorage.setItem("token", res.data.token);
                if(user.user_type === "admin"){
                    navigate("/admin");
                }else if(user.user_type === "service_provider"){
                    navigate("/provider-profile");
                }else{
                    navigate("/");
                }
            }).catch((err) => {
                console.error("Google login error:", err);
                toast.error("Google login failed");
            });
        },
    });

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
        <motion.div 
            className="min-h-screen flex bg-gray-50"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Left Section - Image and Text */}
            <motion.div 
                className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-white p-12"
                variants={itemVariants}
            >
                <div className="w-full max-w-md">
                    <motion.img 
                        src="https://img.freepik.com/free-photo/group-portrait-adorable-puppies_53876-64778.jpg" 
                        alt="Pet Care Illustration" 
                        className="w-full h-auto rounded-lg shadow-md mb-8"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.h2 
                        className="text-2xl font-bold text-gray-800 mb-4"
                        variants={itemVariants}
                    >
                        Welcome to PawCare
                    </motion.h2>
                    <motion.p 
                        className="text-gray-600"
                        variants={itemVariants}
                    >
                        Your trusted platform for all pet care needs. Connect with professional service providers and ensure the best care for your furry friends.
                    </motion.p>
                </div>
            </motion.div>

            {/* Right Section - Login Form */}
            <motion.div 
                className="w-full lg:w-1/2 flex items-center justify-center p-8"
                variants={itemVariants}
            >
                <div className="w-full max-w-md">
                    <motion.div 
                        className="bg-white p-8 rounded-lg shadow-lg"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div 
                            className="text-center mb-8"
                            variants={itemVariants}
                        >
                            <motion.h2 
                                className="text-3xl font-bold text-gray-900"
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                Sign In
                            </motion.h2>
                            <motion.p 
                                className="text-gray-600 mt-2"
                                variants={itemVariants}
                            >
                                Welcome back! Please enter your details
                            </motion.p>
                        </motion.div>

                        <motion.form 
                            onSubmit={handleSubmit} 
                            className="space-y-6"
                            variants={containerVariants}
                        >
                            {/* Email Field */}
                            <motion.div variants={itemVariants}>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <motion.div 
                                    className="mt-1 relative"
                                    whileFocus="focus"
                                    whileTap="tap"
                                    variants={formControlVariants}
                                >
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
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-300"
                                        placeholder="Enter your email"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div variants={itemVariants}>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <motion.div 
                                    className="mt-1 relative"
                                    whileFocus="focus"
                                    whileTap="tap"
                                    variants={formControlVariants}
                                >
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
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-all duration-300"
                                        placeholder="Enter your password"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Remember me and Forgot password */}
                            <motion.div 
                                className="flex items-center justify-between"
                                variants={itemVariants}
                            >
                                <div className="flex items-center">
                                    <motion.input
                                        whileTap={{ scale: 0.9 }}
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-accent)] border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--text-on-primary)] bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                variants={itemVariants}
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <FiLogIn className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    'Sign in'
                                )}
                            </motion.button>

                            {/* Google Login Button */}
                            <motion.div variants={itemVariants}>
                                <div className="relative mt-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <motion.button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <img 
                                        src="https://www.google.com/favicon.ico" 
                                        alt="Google logo" 
                                        className="w-5 h-5"
                                    />
                                    Sign in with Google
                                </motion.button>
                            </motion.div>

                            {/* Register Link */}
                            <motion.div 
                                className="text-center mt-4"
                                variants={itemVariants}
                            >
                                <span className="text-gray-600">Don't have an account? </span>
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Link to="/register" className="font-medium text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors duration-300">
                                        Register here
                                    </Link>
                                </motion.span>
                            </motion.div>
                        </motion.form>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}

