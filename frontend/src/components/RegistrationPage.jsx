import React, { useState } from "react";
import "../styles/Auth.css";
import api from "../Api.js";

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password must have at least one uppercase, one number, and one special character.");
      return;
    }

    try {
      const response = await api.auth.signup({
        name: formData.firstName,
        surname: formData.lastName,
        password: formData.password,
      });

      if (response.status != 200) {
        throw new Error("Registration failed");
      }

      setSuccess("Registration successful!");
    } catch (error) {
      console.error(error);
      setError("Error during registration. Try again.");
    }
  };

  return (
    <div className="component">
      <img className="logo_login" src="logo_login.webp" alt="Delta Logo" />
      <h1 className="title">DELTA</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input className="input-field" type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <input className="input-field" type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <input className="input-field" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input className="input-field" type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
        {error && <div className="popup error-popup">{error}</div>}
        {success && <div className="popup success-popup">{success}</div>}
        <button className="login-button" type="submit">Register</button>
      </form>

      <div className="reg-link">
        <a href="/login" className="link">Already have an account?</a>
      </div>
    </div>
  );
};

export default Registration;
