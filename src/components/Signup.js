import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import '../styles/Signup.css'; // Use separate CSS file for Signup
import { RoleContext } from '../context/RoleContext';

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
        setRole("Student");
        navigate("/login");
      } catch (error) {
        setError("Google OAuth failed. Try again.");
      }
    },
    onError: () => setError("Signup Failed"),
  });

  return (
    <div className="wrapper">
      <div className="login-container">
        <h1>Signup</h1>
        {error && <p className="error">{error}</p>}
        <form>
          <div className="form-row">
            <div className="form-col">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-col">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
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
        <button onClick={googleSignup} className="google-button">
          <span className="google-icon">G</span> Signup with Google
        </button>
        <div className="signup-link">
          <span>Already have an account? </span>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;