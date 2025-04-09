import React from "react";
import "../styles/About.css";
import Footer from "../Shared/Footer";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1> SJCE Event Management System</h1>
        <p>Your ultimate platform for seamless event management and participation at SJCE.</p>
      </div>

      <div className="about-content">
        <div className="feature-card">
          <h2>Effortless Event Creation</h2>
          <p>
            Organizers can quickly create and manage events with all necessary details and recurring schedules.
          </p>
        </div>

        <div className="feature-card">
          <h2>Smart Registration</h2>
          <p>
            Students can easily register for multiple events, receive reminders, and track their registrations.
          </p>
        </div>

        <div className="feature-card">
          <h2>AI-Powered Suggestions</h2>
          <p>
            Get personalized event recommendations based on your interests and past participation.
          </p>
        </div>
      </div>

      <div className="about-footer">
        <p>Join us in making SJCE events better, smarter, and more connected!</p>
      </div>

    
    </div>


  );
};

export default About;