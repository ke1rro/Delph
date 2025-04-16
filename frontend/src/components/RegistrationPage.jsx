import React, { useState } from "react";
import "../styles/Auth.css";
import "../styles/RegistrationSuccessPopup.css";
import api from "../Api.js";
import validator from "validator";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setUserId(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError(
        "Password must have at least one uppercase, one number, one special character, and be at least 8 characters long."
      );
      return;
    }

    try {
      const response = await api.auth.signup({
        name: formData.firstName,
        surname: formData.lastName,
        password: formData.password
      });

      if (response.status !== 200) {
        throw new Error("Registration failed");
      }

      setError("");
      setSuccess("Registration successful!");
      setUserId(response.data);
    } catch (error) {
      console.error(error);
      setError("Error during registration. Try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);

    // Show visual confirmation instead of alert
    setIsCopied(true);

    // Redirect to login page after a short delay
    setTimeout(() => {
      setUserId(null);
      navigate("/login");
    }, 1500);
  };

  return (
    <div>
      <div className={`component ${userId ? "blurred" : ""}`}>
        <img className="logo_login" src="logo.svg" alt="Delph Logo" />
        <h1 className="title">DELPH</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            className="input-field"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button className="login-button" type="submit">
            Register
          </button>
        </form>

        {/* Popup container */}
        <div className="popup-container">
          {error && <div className="popup error-popup">{error}</div>}
          {success && <div className="popup success-popup">{success}</div>}
        </div>

        <div className="reg-link">
          <a href="/login" className="link">
            Already have an account?
          </a>
        </div>
      </div>

      {/* User ID Popup - Redesigned */}
      {userId && (
        <div className="popup-overlay">
          <div className="success-card">
            <div className="success-icon-container">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12L11 15L16 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2 className="success-title">Registration Successful!</h2>
            <p className="success-message">Your account has been created. Please save your ID.</p>

            <div className="user-id-container">
              <div className="user-id-label">Your User ID:</div>
              <div className="user-id-value">{userId}</div>
            </div>

            <button
              className={`copy-id-button ${isCopied ? "copied" : ""}`}
              onClick={handleCopy}
              disabled={isCopied}
            >
              {isCopied ? (
                <>
                  <span className="copy-icon check">✓</span>
                  Copied! Redirecting...
                </>
              ) : (
                <>
                  <span className="copy-icon">📋</span>
                  Copy User ID
                </>
              )}
            </button>

            <p className="id-notice">You'll need this ID to log in to your account</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;
