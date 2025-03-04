import PropTypes from "prop-types";
import React from "react";
import { FiGrid, FiMap, FiUser, FiMessageSquare } from "react-icons/fi";
import "../styles/Navbar.css";

const IconButton = ({ Icon, title, onClick, className }) => {
    return (
        <button className={`icon-button ${className || ""}`} onClick={onClick} title={title}>
            <Icon className="navbar-icon" />
        </button>
    );
};

IconButton.propTypes = {
    Icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export const Navbar = ({ className = "" }) => {
    return (
        <nav className={`navbar ${className}`}>
            <div className="navbar-brand">
                <span className="brand-name">DELTA</span>
                <span className="separator">/</span>
                <span className="brand-subtitle">MONITOR</span>
                <div className="left-icons">
                    <IconButton Icon={FiGrid} title="Menu" onClick={() => alert("Menu clicked")} />
                    <IconButton Icon={FiMap} title="Map" onClick={() => alert("Map clicked")} />
                </div>
            </div>
            <div className="navbar-icons">
                <IconButton Icon={FiUser} title="User Profile" onClick={() => alert("User Profile clicked")} />
                <IconButton Icon={FiMessageSquare} title="Chat" onClick={() => alert("Chat clicked")} />
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    className: PropTypes.string,
};