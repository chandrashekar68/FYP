import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "../styles/Login.css"; // ✅ This must match your folder structure

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  
  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    try {
      const { data } = await axios.post("http://localhost:8000/login", { email, password });
  
      if (data.message === "Login successful") {
        localStorage.setItem("userEmail", email);
        login();
  
        // Fetch username after login
        const userResponse = await axios.get("http://localhost:8000/get_user_name", {
          params: { email },
        });
  
        const username = userResponse.data.user_name
  
        // Redirect based on username existence
        if (!username || username === undefined || username === "") {
          navigate("/create-profile");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };
  

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });

        const { data } = await axios.post("http://localhost:8000/auth/google-login", {
          token: response.access_token,
          email: userInfo.data.email,
          name: userInfo.data.name,
          profilePicture: userInfo.data.picture,
        });

        localStorage.setItem("userEmail", userInfo.data.email);
        login();

        // Fetch username after login
        const userResponse = await axios.get("http://localhost:8000/get_user_name", {
          params: { email: userInfo.data.email },
        });

        const username = userResponse.data.user_name
        
        if (!username || username === undefined || username === "") {
          navigate("/create-profile");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Google OAuth Error:", err);
        setError("Google OAuth failed. Try again.");
      }
    },
    onError: () => setError("Login Failed"),
  });

  return (
    <form onSubmit={handleLogin} className="login-form">
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
      <div className="signup-link">
        <span>Don't have an account? </span>
        <button onClick={() => navigate("/signup")} className="singupBTN">Sign up</button>
      </div>
    </form>
  );
    

};

export default Login;
