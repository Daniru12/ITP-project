import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const NavBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  
  const isServiceProvider = () => {
    if (!isLoggedIn) return false;
    try {
      const decoded = jwtDecode(isLoggedIn);
      return decoded.user_type === 'service_provider';
    } catch (error) {
      return false;
    }
  };

  const isPetOwner = () => {
    if (!isLoggedIn) return false;
    try {
      const decoded = jwtDecode(isLoggedIn);
      return decoded.user_type === 'pet_owner';
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navStyle = {
    background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
  };

  const buttonStyle = {
    backgroundColor: 'var(--color-secondary)',
    color: '#333333',
  };

  return (
    <nav className="fixed w-full top-0 z-50 shadow-lg" style={navStyle}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              🐾 PawGo
            </span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-opacity-80 transition-colors duration-200 text-sm font-medium"
            >
              Home
            </Link>

            <Link 
              to="/petmarketplace" 
              className="text-white hover:text-opacity-80 transition-colors duration-200 text-sm font-medium"
            >
              Marketplace
            </Link>

            <Link 
              to="/display-services" 
              className="text-white hover:text-opacity-80 transition-colors duration-200 text-sm font-medium"
            >
              Pet Care Services
            </Link>


            
            {isLoggedIn ? (
              <>
                {isPetOwner() && (
                  <Link 
                    to="/profile" 
                    className="text-white hover:text-opacity-80 transition-colors duration-200 text-sm font-medium"
                  >
                    Profile
                  </Link>
                )}
                {isServiceProvider() && (
                  <Link 
                    to="/provider-profile" 
                    className="text-white hover:text-opacity-80 transition-colors duration-200 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="hover:bg-opacity-90 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                  style={buttonStyle}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-opacity-80 transition-colors duration-200 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                  style={buttonStyle}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;