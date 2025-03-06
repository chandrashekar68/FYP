import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // Email pattern
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    // if (!passwordRegex.test(password)) {
    //   setError("Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.");
    //   return;
    // }
  
    try {
      const { data } = await axios.post("http://localhost:8000/login", { email, password });
  
      if (data.message === "Login successful") {
        localStorage.setItem("userEmail", email); // Store email in local storage
        login(); // Mark user as logged in (assuming you have this function in AuthContext)
        navigate("/create-profile"); // Redirect to home/landing page
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };
  
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("Google OAuth Success:", response);
  
        // Step 1: Get user details using Google API
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
  
        console.log("Google User Info:", userInfo.data); // Check what data is received
  
        // Step 2: Send user details to your backend for authentication
        const { data } = await axios.post("http://localhost:8000/auth/google-login", {
          token: response.access_token,
          email: userInfo.data.email, // Send email to backend
          name: userInfo.data.name,
          profilePicture: userInfo.data.picture,
        });
  
        // Step 3: Store the email in localStorage
        localStorage.setItem("userEmail", userInfo.data.email);
        console.log("Stored Email in localStorage:", localStorage.getItem("userEmail"));
  
        login(); // Mark user as logged in
        navigate("/create-profile");
      } catch (err) {
        console.error("Google OAuth Error:", err);
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
