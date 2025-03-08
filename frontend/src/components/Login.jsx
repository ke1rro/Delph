import React from "react";
import "../styles/Auth.css";

const Login = () => {
  return (
    <div className="component">
      <img className="logo_login" src="logo_login.webp" alt="Delta Logo" />
      <h1 className="title">DELTA</h1>

      <form className="login-form">
        <input className="input-field" type="text" placeholder="Unique Identifier" />
        <input className="input-field" type="password" placeholder="Password" />
        <button className="login-button" type="submit">
          Login
        </button>
      </form>

      <div className="auth-links">
        <a href="/signup" className="link">Sign up</a>
        <a href="/forgot-password" className="link">Forgot password</a>
      </div>

      <footer className="footer">
        <a href="/about" className="footer-link">About Us</a>
        <a href="/news" className="footer-link">News</a>
      </footer>
    </div>
  );
};

export default Login;
