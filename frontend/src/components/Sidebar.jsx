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
  { Icon: FiBox, alt: "Stack", id: "stack" },
  { Icon: FiClock, alt: "Time Filter", id: "timeFilter" },
  { Icon: FiGlobe, alt: "Globe", id: "globe" },
  { Icon: FiCamera, alt: "Security Camera", id: "camera" },
  { Icon: FiImage, alt: "Image", id: "image" },
  { Icon: FiAlertTriangle, alt: "Warning", id: "warning" },
  { Icon: FiList, alt: "List dashes", id: "list" },
  { Icon: FiFilter, alt: "Funnel", id: "funnel" }
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

export const Sidebar = ({ className = "", onPlusClick, onTimeFilterClick }) => {
  const handleIconClick = (icon) => {
    if (icon.id === "timeFilter" && onTimeFilterClick) {
      onTimeFilterClick();
    } else {
      alert(`${icon.alt} clicked`);
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
            onClick={() => handleIconClick(icon)}
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
  onTimeFilterClick: PropTypes.func
};
