// src/components/Login.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";  // Use useAuth hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); // Use login function from useAuth
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );
        console.log(userInfo.data);
        login();  // Login the user
        navigate("/create-profile");
      } catch (error) {
        setError("Google OAuth failed. Try again.");
      }
    },
    onError: () => setError("Login Failed"),
  });

  return (
    <div className="wrapper">
      <div className="login-container">
        <form>
          <h1>Log In</h1>
          {error && <p className="error">{error}</p>}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
          <button onClick={googleLogin} className="google-button">
            <span className="google-icon">G</span> Sign in with Google
          </button>
        </form>
        <div className="signup-link">
          <span>Don't have an account? </span>
          <button onClick={() => navigate("/signup")}>Sign up</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
