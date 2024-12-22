
import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import girlImage from '../assets/girl.png';
import { ReactComponent as SubmenuIcon } from '../assets/submenu-icon.svg';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, logout, profileCreated } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const sideDrawerRef = useRef(null);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target) && !event.target.closest('.submenu-icon')) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="left">
        <button className="submenu-icon" onClick={toggleDrawer}>
          <SubmenuIcon />
        </button>
        <h1 className="mb-0 d-inline">SJCE</h1>
        <h1 className="mb-0 d-inline ms-2"> COLLEGE</h1>
    <h1 className="mb-0 d-inline ms-2">EVENTS</h1>
      </div>
      <nav className="right">
        <ul>
          <li>About</li>
          <li>Events</li>
          {profileCreated && <li>Notification</li>}
          {!isLoggedIn ? (
            <li onClick={handleLoginClick}>Login</li>
          ) : (
            <>
              {profileCreated && (
                <li onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
                  <img
                    src={girlImage}
                    alt="Profile"
                    className="profile-photo"
                  />
                  {showProfileMenu && (
                    <div className="profile-menu">
                      <p onClick={() => navigate('/profile')}>View Profile</p>
                      <p onClick={logout}>Logout</p>
                    </div>
                  )}
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
      <div className={`side-drawer ${isDrawerOpen ? 'open' : ''}`} ref={sideDrawerRef}>
        <ul>
        <li>
       <a href="/">SJCE EMS</a>
          </li>
          <li>About</li>
          <li>Events</li>
          {!isLoggedIn && <li onClick={handleLoginClick}>Login</li>}
        </ul>
      </div>
    </header>
  );
};

export default Header;