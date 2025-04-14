import PropTypes from "prop-types";
import React, { useState } from "react";
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
import TimeFilter from "./TimeFilter";

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
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);

  const handleIconClick = (action) => {
    if (action === "timeFilter") {
      setTimeFilterOpen(true);
    } else {
      alert(`${action} clicked`);
    }
  };

  return (
    <>
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

      {/* Add the TimeFilter component */}
      <TimeFilter
        isOpen={timeFilterOpen}
        onClose={() => setTimeFilterOpen(false)}
      />
    </>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onPlusClick: PropTypes.func
};
