import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/ProfileModal.css";
import girlImage from "../assets/girl.png";

const ProfileModal = ({ isOpen, onClose }) => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    points: 0,
    badges: [],
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) return;

      try {
        const nameRes = await axios.get("http://localhost:8000/get_user_name", {
          params: { email },
        });

        const gamificationRes = await axios.get(`http://localhost:8000/users/${email}/gamification`);

        setUser({
          username: nameRes.data.user_name,
          email,
          points: gamificationRes.data.points,
          badges: gamificationRes.data.badges,
        });
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    if (isOpen) fetchUserDetails();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <img src={girlImage} alt="Profile Icon" className="profile-icon" />
        <h2>{user.username}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Points:</strong> {user.points}</p>
        <div>
          <strong>Badges:</strong>
          <ul className="badges-list">
            {user.badges && user.badges.length > 0 ? (
              user.badges.map((badge, index) => (
                <li key={index}>{badge}</li>
              ))
            ) : (
              <li>No badges earned yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
