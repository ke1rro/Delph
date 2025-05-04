import React from "react";
import { FiMap, FiGlobe, FiHome, FiNavigation } from "react-icons/fi";
import "../styles/MapTypeSelector.css";

const MapTypeSelector = ({ selectedMapType, onSelectMapType, isVisible = true }) => {
  const mapTypes = [
    { id: "osm", name: "OpenStreetMap", icon: FiGlobe },
    { id: "satellite", name: "Satellite", icon: FiNavigation },
    { id: "streets", name: "Streets", icon: FiMap },
    { id: "basic", name: "Basic", icon: FiHome }
  ];

  return (
    <div className={`map-type-selector ${!isVisible ? 'hidden' : ''}`}>
      <div className="map-type-header">Map Style</div>
      <div className="map-type-options">
        {mapTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              className={`map-type-option ${selectedMapType === type.id ? "active" : ""}`}
              onClick={() => onSelectMapType(type.id)}
              title={type.name}
            >
              <Icon className="map-type-icon" />
              <span className="map-type-name">{type.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MapTypeSelector;