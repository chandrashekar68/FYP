import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importing axios for HTTP requests
import "../styles/Profile.css"; // Import the CSS styles for the profile page

const Profile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
  });

  // Fetch user data from localStorage and fetch username from the API
  useEffect(() => {
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        try {
          // Make an API request to fetch the username based on the email
            const userResponse = await axios.get("http://localhost:8000/get_user_name", {
            params: { email: userEmail },
          });
    
          const fetchedUsername = userResponse.data.user_name;
          setUser({
            username: fetchedUsername,
            email: userEmail,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            username: 'Error fetching username',
            email: userEmail,
          });
        }
      } else {
        setUser({
          username: 'Guest User',
          email: 'Not Logged In',
        });
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Profile</h2>
        <div className="profile-details">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('userEmail');
          window.location.href = '/login'; // Redirect to home or login page
        }}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;
