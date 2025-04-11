import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Header.css";
import girlImage from "../assets/girl.png";
import { ReactComponent as SubmenuIcon } from "../assets/submenu-icon.svg";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ Only one declaration
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  const fetchUserRole = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8000/get_user_role?email=${email}`);
      setUserRole(response.data.user_role);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchNotifications = async (email) => {
    try {
      const res = await axios.get(`http://localhost:8000/users/${email}/notifications`);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setIsLoggedIn(true);
      fetchUserRole(userEmail);
      fetchNotifications(userEmail);
    }
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="left">
        <h1 className="mb-0 d-inline">SJCE COLLEGE EVENTS</h1>
      </div>
      <nav className="right">
        <ul>
          <li className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

            {showNotifications && (
              <div className="notification-dropdown">
                <h4 style={{ fontSize: "1rem" }}>Notifications</h4>
                {notifications.length === 0 ? (
                  <div className="notification-item" style={{ fontSize: "0.9rem" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((note) => (
                    <div key={note.id} className="notification-item" style={{ fontSize: "0.9rem" }}>
                      <strong style={{ fontSize: "1rem" }}>{note.title}</strong>
                      <div>{note.message}</div>
                      <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "#888" }}>
                        {new Date(note.sent_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </li>

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
    </header>
  );
};

export default Header;
