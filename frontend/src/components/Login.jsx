import React, { useState } from "react";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: new URLSearchParams({
          user_id: identifier,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      console.log("Login successful.");
      navigate("/map");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="component">
      <img className="logo_login" src="logo_login.webp" alt="Delta Logo" />
      <h1 className="title">DELTA</h1>

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

      {error && <div className="popup error-popup">{error}</div>}

      <div className="auth-links">
        <a href="/signup" className="link">
          Sign up
        </a>
        <a href="/forgot-password" className="link">
          Forgot password
        </a>
      </div>

      <footer className="footer">
        <a href="/about" className="footer-link">
          About Us
        </a>
        <a href="/news" className="footer-link">
          News
        </a>
      </footer>
    </div>
  );
};

export default Login;
