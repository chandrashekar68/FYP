import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login"; // Adjust the path if needed
import Signup from "./components/Signup"; // Adjust the path for Signup
import StudentDashboard from './components/StudentDashboard';
// import OrganizerDashboard from './components/OrganizerDashboard'; // Uncomment if needed
// import AdminDashboard from './components/AdminDashboard'; // Uncomment if needed
import Header from "./components/Header"; // Header should remain outside the Routes

function App() {
  return (
    <Router>
      {/* Place the Header outside the Routes */}
      <Header />
      <Routes>
        {/* Define routes with the element prop */}
        <Route path="/" element={<h1>Healthy</h1>} />
        <Route path="/login" element={<Login />} /> {/* Login route */}
        <Route path="/signup" element={<Signup />} /> {/* Signup route */}
        <Route path="/student" element={<StudentDashboard />} />
        {/* Add additional routes for other dashboards */}
        {/* <Route path="/organizer" element={<OrganizerDashboard />} /> */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
