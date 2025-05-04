import PropTypes from "prop-types";
import React from "react";
import { FiFilter, FiPlusCircle, FiInfo, FiLayers } from "react-icons/fi";
import "../styles/Sidebar.css";

const icons = [
  { Icon: FiFilter, alt: "Time Filter", id: "timeFilter" },
  { Icon: FiLayers, alt: "Map Layers", id: "mapLayers" },
  { Icon: FiInfo, alt: "Military Symbol Legend", id: "symbolLegend" }
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

export const Sidebar = ({ className = "", onPlusClick, onTimeFilterClick, onSymbolLegendClick, onMapLayersClick }) => {
  const handleIconClick = (icon) => {
    if (icon.id === "timeFilter" && onTimeFilterClick) {
      onTimeFilterClick();
    } else if (icon.id === "symbolLegend" && onSymbolLegendClick) {
      onSymbolLegendClick();
    } else if (icon.id === "mapLayers" && onMapLayersClick) {
      onMapLayersClick();
    } else {
      alert(`${icon.alt} clicked`);
    }
  };

  return (
    <aside className={`sidebar ${className}`}>
      <img className="logo" src="logo_no_title.svg" alt="Logo" />
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
  onTimeFilterClick: PropTypes.func,
  onSymbolLegendClick: PropTypes.func,
  onMapLayersClick: PropTypes.func
};
