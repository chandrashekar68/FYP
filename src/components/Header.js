import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import girlImage from '../assets/girl.png';  // Import the profile image
import { ReactComponent as SubmenuIcon } from '../assets/submenu-icon.svg';  // Import the SVG icon

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const sideDrawerRef = useRef(null);  // Reference to the side drawer

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Close the drawer if the click is outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target) && !event.target.closest('.submenu-icon')) {
        setIsDrawerOpen(false);
      }
    };

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
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
          <li>Dashboard</li>
          <li>Events</li>
          <li>Profile</li>
          <li>CREATE EVENT</li>
          <li>
            <img
              src={girlImage}
              alt="Profile"
              className="profile-photo"
            />
          </li>
        </ul>
      </nav>

      {/* Side Drawer */}
      <div className={`side-drawer ${isDrawerOpen ? 'open' : ''}`} ref={sideDrawerRef}>
        <ul>
          <li>
       <a href="/">SJCE EMS</a>
          </li>

          <li>About</li>
          <li>Dashboard</li>
          <li>Events</li>
          <li>Profile</li>
          <li>Logout</li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
