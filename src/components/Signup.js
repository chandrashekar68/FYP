import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import '../styles/Signup.css';

const Signup = () => {
  const [username, setUsername] = useState(""); // Changed from name to username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const handleSignup = async (e) => {
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
      // console.log(username);
      // console.log(email);
      // console.log(password);
      const { data } = await axios.post(
        "http://localhost:8000/signup", 
        { username, email, password },
        { headers: { "Content-Type": "application/json" }} 
      );
      console.log(data);
      navigate("/login");
    } catch (err) {
      setError(err.response ? err.response.data.detail : "Error during signup");
    }
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { data } = await axios.post(
          "http://localhost:8000/auth/google-signup", 
          { token: response.access_token },
          { headers: { "Content-Type": "application/json" }} // Ensure correct headers
        );
        navigate("/login");
      } catch (err) {
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
        <form onSubmit={handleSignup}>
          <div className="form-row">
            <div className="form-col">
              <label>Username</label> {/* Changed from Name to Username */}
              <input
                type="text"
                value={username} // Changed from name to username
                onChange={(e) => setUsername(e.target.value)}
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
