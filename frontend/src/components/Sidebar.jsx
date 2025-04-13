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
  { Icon: FiClock, alt: "Clock counter" },
  { Icon: FiGlobe, alt: "Globe" },
  { Icon: FiCamera, alt: "Security Camera" },
  { Icon: FiImage, alt: "Image" },
  { Icon: FiAlertTriangle, alt: "Warning" },
  { Icon: FiList, alt: "List dashes" },
  { Icon: FiFilter, alt: "Funnel" }
  // Removed PlusCircle from icons array to handle it separately
];

const IconButton = ({ Icon, title, onClick, className }) => {
  return (
    <button className={`icon-button ${className || ""}`} onClick={onClick} title={title}>
      <Icon className="sidebar-nav-icon" />
    </button>
  );
};

IconButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export const Sidebar = ({ className = "", onPlusClick }) => {
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
            onClick={() => alert(`${icon.alt} clicked`)}
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
  onPlusClick: PropTypes.func
};
