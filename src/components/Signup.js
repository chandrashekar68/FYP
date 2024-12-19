import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import './Login.css';
import { RoleContext } from '../context/RoleContext'; // Updated path

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setRole } = useContext(RoleContext);
  const navigate = useNavigate();

  const googleSignup = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );
        console.log(userInfo.data);
        setRole("Student"); // Assuming role is set to "Student" for all Google users

        // Redirect to login page after signup success
        navigate("/login");
      } catch (error) {
        setError("Google OAuth failed. Try again.");
      }
    },
    onError: (error) => setError("Signup Failed"),
  });

  return (
    <div className="login-container">
      <h1>Signup</h1>
      {error && <p className="error">{error}</p>}
      <form>
        {/* Signup fields */}
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Signup</button>
      </form>

      {/* Google signup button */}
      <button onClick={googleSignup}>Signup with Google</button>

      {/* Switch to login */}
      <button onClick={() => navigate("/login")} style={{ marginTop: '10px', color: 'white' }}>
        Switch to Login
      </button>
    </div>
  );
};

export default Signup;
