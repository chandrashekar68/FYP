import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // Email pattern
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    // Email validation
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    // Password validation
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.");
      return;
    }
  
    try {
      // console.log(email);
      // console.log(password);
      const { data } = await axios.post("http://localhost:8000/login", { username, email, password });
      console.log(data);
      login();
      navigate("/create-profile");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { data } = await axios.post(
          "http://localhost:8000/auth/google-login", 
          { token: response.access_token }
        );
        login();
        navigate("/create-profile");
      } catch (err) {
        setError("Google OAuth failed. Try again.");
      }
    },
    onError: () => setError("Login Failed"),
  });

  return (
    <div className="wrapper">
      <div className="login-container">
        <form onSubmit={handleLogin}>
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
          <button type="button" onClick={googleLogin} className="google-button">
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
