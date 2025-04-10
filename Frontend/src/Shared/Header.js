import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Header.css";
import girlImage from "../assets/girl.png";
import { ReactComponent as SubmenuIcon } from "../assets/submenu-icon.svg";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const sideDrawerRef = useRef(null);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setIsLoggedIn(true);
      fetchUserRole(userEmail);
    }
  }, []);

  const fetchUserRole = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8000/get_user_role?email=${email}`);
      // console.log(`${response.data.user_role}`);
      setUserRole(response.data.user_role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target) && !event.target.closest(".submenu-icon")) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="left">
        <button className="submenu-icon" onClick={toggleDrawer}>
          <SubmenuIcon />
        </button>
        <h1 className="mb-0 d-inline">SJCE</h1>
        <h1 className="mb-0 d-inline ms-2">COLLEGE</h1>
        <h1 className="mb-0 d-inline ms-2">EVENTS</h1>
      </div>
      <nav className="right">
        <ul>
          
          <li><Notification /></li>

          {/* Show Register to Club Button for Logged-in Users */}
          {isLoggedIn && (
            <li>
              <button className="register-club-btn" onClick={() => navigate('/club-registration')}>
                Register to Club
              </button>
            </li>
          )}

          {/* Show Create Event Button Only for Organizers/Supervisors */}
          {isLoggedIn && (userRole === "Organizer" || userRole === "Supervisor") && (
            <li>
              <button className="create-event-btn" onClick={() => navigate('/add-event')}>
                Create Event
              </button>
            </li>
          )}
          
          {isLoggedIn && (userRole === "Supervisor") && (
            <li>
              <button className="create-event-btn" onClick={() => navigate('/add-club')}>
                Add a Club
              </button>
            </li>
          )}

          <li>About</li>
          <li>Events</li>

          {!isLoggedIn ? (
            <li onClick={handleLoginClick}>Login</li>
          ) : (
            <li onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
              <img src={girlImage} alt="Profile" className="profile-photo" />
              {showProfileMenu && (
                <div className="profile-menu">
                  <p onClick={() => navigate("/profile")}>View Profile</p>
                  <p onClick={handleLogout}>Logout</p>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>

      <div className={`side-drawer ${isDrawerOpen ? "open" : ""}`} ref={sideDrawerRef}>
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
