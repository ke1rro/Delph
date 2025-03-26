import React, { useState } from "react";
import styled from "styled-components";
import "../styles/Auth.css";
import api from "../Api.js";
import validator from "validator";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null); // State to store the user ID

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");
    setUserId(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password must have at least one uppercase, one number, one special character, and be at least 8 characters long.");
      return;
    }

    try {
      const response = await api.auth.signup({
        name: formData.firstName,
        surname: formData.lastName,
        password: formData.password,
      });

      if (response.status !== 200) {
        throw new Error("Registration failed");
      }

      setError("");
      setSuccess("Registration successful!");
      setUserId(response.data); // Set the user ID from the response
    } catch (error) {
      console.error(error);
      setError("Error during registration. Try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    alert("User ID copied to clipboard!");
    setUserId(null); // Hide the popup after copying
  };

  return (
    <StyledWrapper blurBackground={!!userId}>
      <div className="component">
        <img className="logo_login" src="logo_login.webp" alt="Delta Logo" />
        <h1 className="title">DELTA</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input className="input-field" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input className="input-field" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input className="input-field" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input className="input-field" type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          <button className="login-button" type="submit">Register</button>
        </form>

        {/* Popup container */}
        <div className="popup-container">
          {error && <div className="popup error-popup">{error}</div>}
          {success && <div className="popup success-popup">{success}</div>}
        </div>

        <div className="reg-link">
          <a href="/login" className="link">Already have an account?</a>
        </div>
      </div>

      {/* User ID Popup */}
      {userId && (
        <div className="popup-overlay">
          <div className="card">
            <div className="header">
              <span className="icon">
                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" fillRule="evenodd" />
                </svg>
              </span>
              <p className="alert">Registration Successful!</p>
            </div>
            <p className="message">Your User ID:</p>
            <div className="user-id-box">{userId}</div>
            <div className="actions">
              <button className="copy-button" onClick={handleCopy}>
                Copy User ID
              </button>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  /* Blur the background when the popup is active */
  ${({ blurBackground }) =>
    blurBackground &&
    `
    .component {
      filter: blur(5px);
      pointer-events: none;
    }
  `}

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  }

  .card {
    position: relative;
    max-width: 320px;
    border-width: 1px;
    border-color: rgba(219, 234, 254, 1);
    border-radius: 1rem;
    background-color: rgba(33, 46, 79, 0.95);
    padding: 1rem;
    text-align: center;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    font-family: "Inter", sans-serif;
    color: white;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: rgba(59, 130, 246, 1);
    padding: 0.5rem;
    color: rgba(255, 255, 255, 1);
  }

  .icon svg {
    height: 1rem;
    width: 1rem;
  }

  .alert {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    font-size: 1.2rem;
  }

  .message {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .user-id-box {
    background-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 1);
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
    font-size: 18px;
    margin: 10px 0;
  }

  .actions {
    margin-top: 1.5rem;
  }

  .copy-button {
    display: inline-block;
    border-radius: 0.5rem;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
    background-color: rgba(59, 130, 246, 1);
    color: rgb(3, 1, 1);
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .copy-button:hover {
    background-color: rgba(37, 99, 235, 1);
  }
`;

export default Registration;