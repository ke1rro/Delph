import PropTypes from "prop-types";
import React from "react";
import { FiMap, FiUser, FiMessageSquare, FiHome } from "react-icons/fi";
import "../styles/Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";

const IconButton = ({ Icon, title, onClick, className, isActive }) => {
  return (
    <button
      className={`icon-button ${isActive ? 'active' : ''} ${className || ""}`}
      onClick={onClick}
      title={title}
    >
      <Icon className="navbar-icon" />
    </button>
  );
};

IconButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  isActive: PropTypes.bool,
};

export const Navbar = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className={`navbar ${className}`}>
      <div className="navbar-brand">
        <span className="brand-name">DELTA</span>
        <span className="separator">/</span>
        <span className="brand-subtitle">MONITOR</span>
        <div className="left-icons">
          <IconButton
            Icon={FiHome}
            title="Dashboard"
            onClick={() => navigate("/dashboard")}
            isActive={currentPath === "/dashboard"}
          />
          <IconButton
            Icon={FiMap}
            title="Map"
            onClick={() => navigate("/map")}
            isActive={currentPath === "/map"}
          />
        </div>
      </div>
      <div className="navbar-icons">
        <IconButton
          Icon={FiUser}
          title="User Profile"
          onClick={() => navigate("/profile")}
          isActive={currentPath === "/profile"}
        />
        <IconButton
          Icon={FiMessageSquare}
          title="Chat"
          onClick={() => alert("Chat clicked")}
        />
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  className: PropTypes.string,
};
