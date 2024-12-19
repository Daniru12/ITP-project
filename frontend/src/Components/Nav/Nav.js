import React from 'react';
import './Nav.css';
import { Link } from "react-router-dom";

function Nav() {
    return (
        <div>
            <div className="navbar">
                <div className="logo"><Link to="/" className="logo-link">Food</Link></div> {/* Added class 'logo-link' */}
                <nav>
                    <ul>
                        
                        <li><Link to="/get">Order Details</Link></li>
                        <li><Link to="/sendpdf" className="nav-link active">Send Food Report</Link></li>
                        <li><Link to="/img">Gallery</Link></li>
                        <li><Link to="/con">Contact Us</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        
                        <li><Link to="/log" className="nav-link active">Login</Link></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default Nav;
