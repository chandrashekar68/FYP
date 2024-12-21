import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import StudentDashboard from './components/StudentDashboard';
import CreateProfile from './components/CreateProfile';
import LandingPage from './components/LandingPage';
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if the user has scrolled to the bottom
    setIsBottom(scrollTop + windowHeight >= documentHeight - 1);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<h1>Healthy</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/create-profile" element={<CreateProfile />} />
      </Routes>
      {isBottom && <Footer />} {/* Footer renders only when at the bottom */}
    </Router>
  );
}

export default App;