import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX, FiCalendar, FiMapPin, FiInfo, FiTag, FiUsers, FiActivity } from "react-icons/fi";
import "../styles/EventSidebar.css";
import ms from "milsymbol";
import DraggableSVGPreview from "./DraggableSVGPreview";

const EventSidebar = ({ isOpen, onClose, onSubmit }) => {
  const [sidcData, setSidcData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entityTree, setEntityTree] = useState([]);
  const [entitySelections, setEntitySelections] = useState([]);
  const [entityPath, setEntityPath] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const [svgPreviewVisible, setSvgPreviewVisible] = useState(false);
  const [currentSidc, setCurrentSidc] = useState(null);
  const [eventData, setEventData] = useState({
    title: "",
    location: { latitude: "", longitude: "" },
    entity: {
      entity: "ground",
      entityPath: "",
      affiliation: "friend",
      status: "present"
    },
    description: "",
  });

  useEffect(() => {
    const fetchSidcData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/sidc.json");
        const data = await response.json();
        setSidcData(data);

        const topLevelEntities = Object.keys(data.entity)
          .filter(key => !key.includes(':'))
          .map(key => ({
            value: key,
            label: capitalizeFirstLetter(key)
          }));

        setEntityTree(topLevelEntities);
      } catch (error) {
        console.error("Error fetching SIDC data:", error);
      }
      setLoading(false);
    };

    fetchSidcData();
  }, []);


  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };


  useEffect(() => {
    if (!sidcData) return;

    if (!entityPath) {
      setEntitySelections([entityTree]);
      setSelectedValues([]);
      return;
    }

    const getChildEntities = (path) => {
      const prefix = path ? path + ':' : '';
      const directChildPaths = new Map();

      Object.keys(sidcData.entity).forEach(key => {
        if (key.startsWith(prefix) && key !== path) {
          const remaining = key.substring(prefix.length);
          const nextSegment = remaining.includes(':')
            ? remaining.substring(0, remaining.indexOf(':'))
            : remaining;

          if (nextSegment) {
            const fullChildPath = prefix + nextSegment;

            if (!directChildPaths.has(nextSegment) || key === fullChildPath) {
              directChildPaths.set(nextSegment, {
                value: fullChildPath,
                label: capitalizeFirstLetter(nextSegment),
                hasSymbol: sidcData.entity[fullChildPath] ? true : false
              });
            }
          }
        }
      });

      const childEntities = Array.from(directChildPaths.values());
      return childEntities.length > 0 ? childEntities : null;
    };

    const selections = [entityTree];
    const pathParts = entityPath.split(':');

    const newSelectedValues = [entityPath.split(':')[0]];

    let currentPath = pathParts[0];
    for (let i = 1; i < pathParts.length; i++) {
      const children = getChildEntities(currentPath);
      if (children) {
        selections.push(children);
      }
      currentPath = currentPath + ':' + pathParts[i];
      newSelectedValues.push(currentPath);
    }

    const finalChildren = getChildEntities(currentPath);
    if (finalChildren) {
      selections.push(finalChildren);
    }

    setSelectedValues(newSelectedValues);
    setEntitySelections(selections);
  }, [entityPath, sidcData, entityTree]);

  const handleEntitySelect = (value, level) => {
    if (level === 0) {
      setEntityPath(value);
    } else {
      const pathParts = entityPath.split(':');
      const newPathParts = pathParts.slice(0, level);

      newPathParts.push(value.split(':').pop());

      const newPath = value;
      setEntityPath(newPath);
    }

    setEventData({
      ...eventData,
      entity: {
        ...eventData.entity,
        entity: value.split(':')[0],
        entityPath: value
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEventData({
        ...eventData,
        [parent]: {
          ...eventData[parent],
          [child]: value
        }
      });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(eventData);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const basicEntityType = eventData.entity.entity;
      setEntityPath(basicEntityType);
      setEventData({
        ...eventData,
        entity: {
          ...eventData.entity,
          entityPath: basicEntityType
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!sidcData || !eventData.entity.entityPath) return;

    try {
      const sidc = sidcData.entity[eventData.entity.entityPath];
      if (!sidc) {
        console.warn(`No SIDC found for path: ${eventData.entity.entityPath}`);
        return;
      }

      const affiliation = sidcData.affiliation[eventData.entity.affiliation] || 'F';
      const status = sidcData.status[eventData.entity.status] || 'P';

      const updatedSidc = sidc.replace("@", affiliation).replace("#", status);
      console.log("Generated SIDC:", updatedSidc);

      setCurrentSidc(updatedSidc);

      setSvgPreviewVisible(true);
    } catch (error) {
      console.error("Error generating SIDC:", error);
    }
  }, [sidcData, eventData.entity]);

  const togglePreview = () => {
    setSvgPreviewVisible(!svgPreviewVisible);
  };

  return (
    <>
      <StyledSidebar className={`event-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="event-sidebar-header">
          <h2><FiCalendar /> Add New Event</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              <FiInfo /> Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              required
              placeholder="Event title"
            />
          </div>

          <div className="form-group">
            <label>
              <FiMapPin /> Location
            </label>
            <div className="location-inputs">
              <input
                type="text"
                name="location.latitude"
                value={eventData.location.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                required
              />
              <input
                type="text"
                name="location.longitude"
                value={eventData.location.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <FiTag /> Entity Type
            </label>

            {loading ? (
              <div className="loading-indicator">Loading entity types...</div>
            ) : (
              <div className="entity-selection-container">
                {entitySelections.map((options, level) => (
                  <select
                    key={level}
                    className="entity-select"
                    value={selectedValues[level] || ''}
                    onChange={(e) => handleEntitySelect(e.target.value, level)}
                  >
                    <option value="">Select {level === 0 ? 'Type' : 'Subtype'}</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              <FiUsers /> Affiliation
            </label>
            <select
              name="entity.affiliation"
              value={eventData.entity.affiliation}
              onChange={handleChange}
            >
              <option value="friend">Friend</option>
              <option value="hostile">Hostile</option>
              <option value="neutral">Neutral</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <FiActivity /> Status
            </label>
            <select
              name="entity.status"
              value={eventData.entity.status}
              onChange={handleChange}
            >
              <option value="present">Present</option>
              <option value="planned">Planned</option>
              <option value="anticipated">Anticipated</option>
              <option value="active">Active</option>
              <option value="destroyed">Destroyed</option>
              <option value="disabled">Disabled</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={eventData.description}
              onChange={handleChange}
              placeholder="Event description"
              rows="4"
            />
          </div>

          <button
            type="button"
            className="preview-button"
            onClick={togglePreview}
          >
            {svgPreviewVisible ? "Hide Symbol Preview" : "Show Symbol Preview"}
          </button>

          <button type="submit" className="submit-button">
            Create Event
          </button>
        </form>
      </StyledSidebar>

      <DraggableSVGPreview
        sidc={currentSidc}
        visible={svgPreviewVisible && isOpen}
        onClose={() => setSvgPreviewVisible(false)}
      />
    </>
  );
};

const StyledSidebar = styled.div`
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100vh;
  background-color: var(--color-primary);
  transition: right 0.3s ease;
  z-index: 1000;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;

  &.open {
    right: 0;
  }
`;

export default EventSidebar;