import React from "react";
import { Link } from "react-router-dom";
import "../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-header">
        <img
          src="/logo_title.svg"
          alt="Delph Logo"
          className="about-us-logo"
        />
        <h1>About Delph</h1>
      </div>

      <section className="about-us-section">
        <h2>Our Mission</h2>
        <p>
          Delph is a cutting-edge platform designed to provide secure real-time communication,
          location tracking, and operational insights. Our goal is to empower teams with the tools
          they need to coordinate effectively and make informed decisions in critical situations.
        </p>
      </section>

      <section className="about-us-section">
        <h2>Key Features</h2>
        <ul className="about-us-list">
          <li>
            <strong>Real-time Messaging:</strong> Secure and encrypted communication for seamless
            collaboration.
          </li>
          <li>
            <strong>Location Tracking:</strong> Accurate GPS tracking with real-time updates.
          </li>
          <li>
            <strong>Event Management:</strong> Create, track, and manage events with ease.
          </li>
          <li>
            <strong>Secure Access:</strong> Robust authentication to ensure data privacy and
            security.
          </li>
        </ul>
      </section>

      <section className="about-us-section">
        <h2>Our Vision</h2>
        <p>
          At Delph, we envision a world where technology bridges the gap between field operations
          and command centers, ensuring safety, efficiency, and success in every mission.
        </p>
      </section>

      <div className="about-us-buttons">
        <Link to="/login">
          <button className="about-us-button">Login</button>
        </Link>
        <Link to="/signup">
          <button className="about-us-button">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;
