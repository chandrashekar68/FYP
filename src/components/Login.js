import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import './Login.css';
import { RoleContext } from '../context/RoleContext'; // Updated path

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setRole } = useContext(RoleContext);
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
        setRole("Student"); // Assuming role is set to "Student" for all Google users

        // Redirect to /student after successful login
        navigate("/student");
      } catch (error) {
        setError("Google OAuth failed. Try again.");
      }
    },
    onError: (error) => setError("Login Failed"),
  });

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}
      <form>
        {/* Common fields for login */}
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

        <button type="submit">Login</button>
      </form>

      {/* Google login button */}
      <button onClick={googleLogin}>Login with Google</button>

      {/* Switch to signup */}
      <button onClick={() => navigate("/signup")} style={{ marginTop: '10px', color: 'white' }}>
        Switch to Signup
      </button>
    </div>
  );
};

export default Login;
