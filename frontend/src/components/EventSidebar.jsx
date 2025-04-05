import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiX, FiCalendar, FiMapPin, FiInfo, FiTag, FiUsers, FiActivity, FiEdit, FiTrash2, FiZap } from "react-icons/fi";
import "../styles/EventSidebar.css";
import ms from "milsymbol";
import DraggableSVGPreview from "./DraggableSVGPreview";
import SidcDataService from "../utils/SidcDataService";
import Api from "../Api";
import { v4 as uuidv4 } from 'uuid';

const EventSidebar = ({ isOpen, onClose, onSubmit, selectedEvent = null, onUpdate = null }) => {
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
    velocity: {
      speed: "",
      direction: ""
    },
    description: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchSidcData = async () => {
      setLoading(true);
      try {
        const sidcDataService = SidcDataService.getInstance();
        const data = await sidcDataService.getData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Create message object according to schema
      const message = {
        id: isEditMode ? eventData.id : uuidv4(), // Use existing ID if editing
        timestamp: Date.now(), // Current timestamp in ms
        ttl: 7 * 24 * 60 * 60 * 1000, // Default 7 days TTL
        source: {
          id: localStorage.getItem('userId') || 'anonymous', // Use authenticated user ID if available
          name: localStorage.getItem('userName') || null,
          comment: eventData.description || null
        },
        location: {
          latitude: parseFloat(eventData.location.latitude),
          longitude: parseFloat(eventData.location.longitude),
          altitude: null,
          radius: null
        },
        velocity: eventData.velocity.speed || eventData.velocity.direction
          ? {
              speed: eventData.velocity.speed ? parseFloat(eventData.velocity.speed) : null,
              direction: eventData.velocity.direction ? parseFloat(eventData.velocity.direction) : null
            }
          : null,
        entity: {
          affiliation: mapAffiliation(eventData.entity.affiliation),
          entity: eventData.entity.entityPath,
          status: mapStatus(eventData.entity.status)
        }
      };

      // Call API to create or update message
      if (isEditMode) {
        await Api.bridge.updateMessage(message);
        if (onUpdate) onUpdate(message);
      } else {
        await Api.bridge.createMessage(message);
        if (onSubmit) onSubmit(eventData);
      }

      // Close sidebar
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      setSubmitError(`Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!isEditMode || !eventData.id) return;

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      // Create an updated message with the new status
      const updatedMessage = {
        id: eventData.id,
        timestamp: Date.now(),
        ttl: 7 * 24 * 60 * 60 * 1000,
        source: {
          id: localStorage.getItem('userId') || 'anonymous',
          name: localStorage.getItem('userName') || null,
          comment: eventData.description || null
        },
        location: {
          latitude: parseFloat(eventData.location.latitude),
          longitude: parseFloat(eventData.location.longitude),
          altitude: null,
          radius: null
        },
        velocity: eventData.velocity.speed || eventData.velocity.direction
          ? {
              speed: eventData.velocity.speed ? parseFloat(eventData.velocity.speed) : null,
              direction: eventData.velocity.direction ? parseFloat(eventData.velocity.direction) : null
            }
          : null,
        entity: {
          affiliation: mapAffiliation(eventData.entity.affiliation),
          entity: eventData.entity.entityPath,
          status: mapStatus(newStatus)
        }
      };

      // Update the event
      await Api.bridge.updateMessage(updatedMessage);

      // Update local state
      setEventData({
        ...eventData,
        entity: {
          ...eventData.entity,
          status: newStatus
        }
      });

      if (onUpdate) onUpdate(updatedMessage);

    } catch (error) {
      console.error("Error updating event status:", error);
      setSubmitError("Failed to update event status. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Map UI affiliation values to API schema values
  const mapAffiliation = (affiliation) => {
    const affiliationMap = {
      'friend': 'friend',
      'hostile': 'hostile',
      'neutral': 'neutral',
      'unknown': 'unknown'
    };
    return affiliationMap[affiliation] || 'unknown';
  };

  // Map UI status values to API schema values
  const mapStatus = (status) => {
    const statusMap = {
      'active': 'active',
      'disabled': 'disabled',
      'destroyed': 'destroyed',
      'unknown': 'unknown'
    };
    return statusMap[status] || 'unknown';
  };

  useEffect(() => {
    if (isOpen) {
      if (selectedEvent) {
        setIsEditMode(true);
        setEventData({
          id: selectedEvent.id,
          title: selectedEvent.source?.comment || "",
          location: {
            latitude: selectedEvent.location?.latitude?.toString() || "",
            longitude: selectedEvent.location?.longitude?.toString() || "",
          },
          entity: {
            entity: selectedEvent.entity?.entity?.split(':')[0] || "ground",
            entityPath: selectedEvent.entity?.entity || "",
            affiliation: reverseMapAffiliation(selectedEvent.entity?.affiliation) || "friend",
            status: reverseMapStatus(selectedEvent.entity?.status) || "present"
          },
          velocity: {
            speed: selectedEvent.velocity?.speed?.toString() || "",
            direction: selectedEvent.velocity?.direction?.toString() || ""
          },
          description: selectedEvent.source?.comment || "",
        });
        setEntityPath(selectedEvent.entity?.entity || "");
      } else {
        // Create mode - reset form
        setIsEditMode(false);
        setEventData({
          title: "",
          location: { latitude: "", longitude: "" },
          entity: {
            entity: "ground",
            entityPath: "",
            affiliation: "friend",
            status: "present"
          },
          velocity: {
            speed: "",
            direction: ""
          },
          description: "",
        });
        const basicEntityType = "ground";
        setEntityPath(basicEntityType);
      }
    }
  }, [isOpen, selectedEvent]);

  // Reverse map API schema values to UI affiliation values
  const reverseMapAffiliation = (affiliation) => {
    const reverseMap = {
      'friend': 'friend',
      'hostile': 'hostile',
      'neutral': 'neutral',
      'unknown': 'unknown'
    };
    return reverseMap[affiliation] || 'unknown';
  };

  // Reverse map API schema values to UI status values
  const reverseMapStatus = (status) => {
    const reverseMap = {
      'active': 'active',
      'disabled': 'disabled',
      'destroyed': 'destroyed',
      'unknown': 'unknown'
    };
    return reverseMap[status] || 'present';
  };

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
          <h2>
            {isEditMode ? <FiEdit /> : <FiCalendar />}
            {isEditMode ? 'Update Event' : 'Add New Event'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {isEditMode && (
          <div className="quick-actions">
            <button
              className="status-button destroyed"
              onClick={() => handleStatusChange('destroyed')}
              disabled={eventData.entity.status === 'destroyed'}
            >
              <FiTrash2 /> Mark as Destroyed
            </button>
            <button
              className="status-button disabled"
              onClick={() => handleStatusChange('disabled')}
              disabled={eventData.entity.status === 'disabled'}
            >
              Disable
            </button>
          </div>
        )}

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
              <FiZap /> Velocity
            </label>
            <div className="velocity-inputs">
              <input
                type="number"
                name="velocity.speed"
                value={eventData.velocity.speed}
                onChange={handleChange}
                placeholder="Speed (km/h)"
              />
              <input
                type="number"
                name="velocity.direction"
                value={eventData.velocity.direction}
                onChange={handleChange}
                placeholder="Direction (degrees)"
                min="0"
                max="359"
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

          {submitError && (
            <div className="error-message">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={submitLoading}
          >
            {submitLoading ?
              (isEditMode ? "Updating..." : "Creating...") :
              (isEditMode ? "Update Event" : "Create Event")
            }
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
  font-family: "Inter", sans-serif;
  background-color: var(--color-primary);
  transition: right 0.3s ease;
  z-index: 1000;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;

  &.open {
    right: 0;
  }

  .quick-actions {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    background-color: rgba(0, 0, 0, 0.05);

    .status-button {
      padding: 6px 12px;
      border-radius: 4px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.destroyed {
        background-color: #f44336;
        color: white;
      }

      &.disabled {
        background-color: #757575;
        color: white;
      }
    }
  }

  .velocity-inputs {
    display: flex;
    gap: 10px;
  }

  .velocity-inputs input {
    flex: 1;
  }

  &.selected-event-active {
    border-left: 4px solid #ffeb3b;
  }
`;

export default EventSidebar;