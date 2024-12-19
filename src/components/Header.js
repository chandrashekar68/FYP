import React from "react";
import  './Header.css';
import logo from "../assets/logo.png"; 

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <img src={logo} alt="College Logo" className="header-logo" />
        <h1 className="header-title">AI-powered College Event Management System</h1>
      </div>
    </header>
  );
};

export default Header;
