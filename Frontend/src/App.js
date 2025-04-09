
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import EventForm from "./components/EventForm";
import CreateProfile from './components/CreateProfile';
import LandingPage from './components/LandingPage';
import ClubRegistration from "./components/ClubRegistration";
import Header from "./Shared/Header";
import Footer from "./Shared/Footer";
import { AuthProvider } from "./context/AuthContext";
import Profile from './components/Profile';
import About from "./components/About"; 

function App() {
  const [isBottom, setIsBottom] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    setIsBottom(scrollTop + windowHeight >= documentHeight - 1);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<h1>Healthy</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<LandingPage />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/add-event" element={<EventForm />} />
          <Route path="/club-registration" element={<ClubRegistration />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        {isBottom && <Footer />}
      </Router>
    </AuthProvider>
  );
}

export default App;