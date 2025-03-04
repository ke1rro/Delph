import React from "react";
import "../styles/Auth.css";

const Registration = () => {
  return (
    <div className="component">
      <img className="logo_login" src="logo_login.webp" alt="Delta Logo" />
      <h1 className="title">DELTA</h1>

      <form className="login-form">
        <input className="input-field" type="text" placeholder="First name" />
        <input className="input-field" type="text" placeholder="Last Name" />
        <input className="input-field" type="email" placeholder="Email" />
        <input className="input-field" type="password" placeholder="Password" />
        <input
          className="input-field"
          type="password"
          placeholder="Confirm Password"
        />
        <button className="login-button" type="submit">
          Register
        </button>
      </form>

      <div className="reg-link">
        <a href="/login" className="link">
          Already have an account?
        </a>
      </div>
    </div>
  );
};

export default Registration;
