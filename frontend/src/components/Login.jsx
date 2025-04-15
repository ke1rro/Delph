import React, { useState } from "react";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";
import api from "../Api.js";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.auth.login({
        user_id: identifier,
        password: password
      });

      if (response.status !== 200) {
        throw new Error("Invalid credentials");
      }

      setSuccess("Login successful!");
      console.log("Login successful.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Error during login. Try again.");
    }
  };

  return (
    <div className="component">
      <img className="logo_login" src="logo_login.webp" alt="Delta Logo" />
      <h1 className="title">DELPH</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          placeholder="Unique Identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-button" type="submit">
          Login
        </button>
      </form>

      {/* Popup container */}
      <div className="popup-container">
        {error && <div className="popup error-popup">{error}</div>}
        {success && <div className="popup success-popup">{success}</div>}
      </div>

      <div className="auth-links">
        <a href="/signup" className="link">
          Sign up
        </a>
      </div>

      <footer className="footer">
        <a href="/about" className="footer-link">
          About Us
        </a>
      </footer>
    </div>
  );
};

export default Login;
