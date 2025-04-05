import React from 'react';
import './Footer.css';
import logo from '../assets/swamiji.png'; // Adjust the logo path

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <img src={logo} alt="Logo" className="footer-logo" />
        <p>© JSS Technical Institutions - Event Management System 2025</p>
      </div>
    </footer>
  );
};

export default Footer;