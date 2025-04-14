import PropTypes from "prop-types";
import React from "react";
import {
  FiBox,
  FiClock,
  FiGlobe,
  FiCamera,
  FiImage,
  FiAlertTriangle,
  FiList,
  FiFilter,
  FiPlusCircle
} from "react-icons/fi";
import "../styles/Sidebar.css";

const icons = [
  { Icon: FiBox, alt: "Stack" },
  { Icon: FiClock, alt: "Clock counter", action: "timeFilter" },
  { Icon: FiGlobe, alt: "Globe" },
  { Icon: FiCamera, alt: "Security Camera" },
  { Icon: FiImage, alt: "Image" },
  { Icon: FiAlertTriangle, alt: "Warning" },
  { Icon: FiList, alt: "List dashes" },
  { Icon: FiFilter, alt: "Funnel" }
];

const IconButton = ({ Icon, title, onClick, className, isActive }) => {
  return (
    <button
      className={`icon-button ${className || ""} ${isActive ? "active" : ""}`}
      onClick={onClick}
      title={title}
    >
      <Icon className="sidebar-nav-icon" />
    </button>
  );
};

IconButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  isActive: PropTypes.bool
};

export const Sidebar = ({ className = "", onPlusClick, onTimeFilterClick, isFilterActive }) => {
  const handleIconClick = (action) => {
    if (action === "timeFilter") {
      if (onTimeFilterClick) onTimeFilterClick();
    } else {
      alert(`${action} clicked`);
    }
  };

  return (
    <aside className={`sidebar ${className}`}>
      <img className="logo" src="logo.webp" alt="Logo" />
      <nav className="sidebar-nav">
        {icons.map((icon, index) => (
          <IconButton
            key={index}
            Icon={icon.Icon}
            title={icon.alt}
            className={icon.className}
            onClick={() => handleIconClick(icon.action || icon.alt)}
            isActive={icon.action === "timeFilter" && isFilterActive}
          />
        ))}
        {/* Add the plus icon separately at the bottom */}
        <IconButton
          Icon={FiPlusCircle}
          title="Add Event"
          className="plus-icon"
          onClick={onPlusClick}
        />
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onPlusClick: PropTypes.func,
  onTimeFilterClick: PropTypes.func,
  isFilterActive: PropTypes.bool
};
