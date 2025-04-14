import React, { useState } from 'react';
import { FiClock, FiCalendar, FiX, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import '../styles/TimeFilterStyles.css';
import HistoryClient from '../api/HistoryClient';

const TimeFilter = ({ isOpen, onClose, onFilterApplied = () => {} }) => {
  const [activePreset, setActivePreset] = useState('today');
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState('2024-06-18');
  const [hourStart, setHourStart] = useState(0);
  const [hourEnd, setHourEnd] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const historyClient = new HistoryClient();

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    setError(null);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch(preset) {
      case 'today':
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setStartDate(yesterday.toISOString().split('T')[0]);
        setEndDate(yesterday.toISOString().split('T')[0]);
        break;
      case 'thisWeek':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        setStartDate(firstDayOfWeek.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(today.getDate() - 6);
        setStartDate(last7days.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'last30days':
        const last30days = new Date(today);
        last30days.setDate(today.getDate() - 29);
        setStartDate(last30days.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      default:
        break;
    }
  };

  const handleApply = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startTimeDate = new Date(startDate);
      startTimeDate.setHours(hourStart, 0, 0, 0);
      const startTimestamp = startTimeDate.getTime();

      const endTimeDate = new Date(endDate);
      endTimeDate.setHours(hourEnd, 0, 0, 0);
      const endTimestamp = endTimeDate.getTime();

      // Validate timestamps
      if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
        throw new Error("Invalid date range selected");
      }

      if (startTimestamp > endTimestamp) {
        throw new Error("Start date cannot be after end date");
      }

      console.log(`📅 Fetching events from ${new Date(startTimestamp).toLocaleString()} to ${new Date(endTimestamp).toLocaleString()}`);

      const events = await historyClient.getAggregatedEvents(startTimestamp, endTimestamp);

      // Log details about received events
      if (events && Array.isArray(events)) {
        console.log(`📊 Retrieved ${events.length} events from history service`);

        // Log first few events for debugging
        if (events.length > 0) {
          console.group('📋 Sample of retrieved events:');
          const sampleEvents = events.slice(0, 3);
          sampleEvents.forEach((event, index) => {
            const eventData = event.message || event;  // Handle both direct and nested formats
            console.log(`Event ${index + 1}:`, {
              id: eventData.id || event.id || event._id,
              timestamp: new Date(eventData.timestamp || event.timestamp || event.created_at || Date.now()).toLocaleString(),
              entity: eventData.entity?.entity || event.entity?.entity || 'unknown',
              location: eventData.location || event.location || 'unknown',
            });
          });
          console.groupEnd();
        }

        // Validate and normalize events to ensure consistent structure
        const formattedEvents = events.map(event => {
          if (!event) return null;

          // Extract the data correctly from any structure we might receive
          const eventData = event.message || event;

          // Get ID from wherever it might be
          const eventId = eventData.id || event.id || event._id;
          if (!eventId) return null;

          // Handle various timestamp formats including MongoDB NumberLong
          let timestamp = null;
          if (typeof eventData.timestamp === 'object' && eventData.timestamp?.$numberLong) {
            timestamp = parseInt(eventData.timestamp.$numberLong);
          } else {
            timestamp = eventData.timestamp || event.timestamp || event.created_at || Date.now();
          }

          // Handle location data wherever it might be
          const location = eventData.location || event.location;
          if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
            // Create default location if missing
            return {
              id: eventId,
              timestamp: timestamp,
              ttl: eventData.ttl || event.ttl || 7 * 24 * 60 * 60 * 1000,
              location: { latitude: 0, longitude: 0 },
              velocity: eventData.velocity || event.velocity || { x: 0, y: 0 },
              entity: eventData.entity || event.entity || {
                entity: "ground",
                affiliation: "unknown",
                status: "active"
              },
              source: eventData.source || event.source || {
                id: "history",
                name: "History Service",
                comment: eventData.comment || event.comment || ""
              }
            };
          }

          return {
            id: eventId,
            timestamp: timestamp,
            ttl: eventData.ttl || event.ttl || 7 * 24 * 60 * 60 * 1000,
            location: location,
            velocity: eventData.velocity || event.velocity || { x: 0, y: 0 },
            entity: eventData.entity || event.entity || {
              entity: "ground",
              affiliation: "unknown",
              status: "active"
            },
            source: eventData.source || event.source || {
              id: "history",
              name: "History Service",
              comment: eventData.comment || event.comment || ""
            }
          };
        }).filter(event => event !== null);

        if (formattedEvents.length === 0) {
          throw new Error("No valid events found in the specified time range");
        }

        onFilterApplied(formattedEvents, {
          startTime: startTimestamp,
          endTime: endTimestamp,
          isFiltered: true
        });

        onClose();
      } else {
        throw new Error("Invalid response format from history service");
      }
    } catch (err) {
      console.error("Error fetching historical events:", err);
      setError(err.message || "Failed to fetch historical events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setActivePreset('today');

    const today = new Date();
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    setHourStart(0);
    setHourEnd(24);
    setError(null);

    onFilterApplied(null, {
      isFiltered: false
    });

    onClose();
  };

  return (
    <div className={`time-filter-container ${isOpen ? 'open' : ''}`}>
      <div className="time-filter-header">
        <h2>
          <FiClock />
          Time Filter
        </h2>
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="time-filter-content">
        <div className="filter-section">
          <h3><FiCalendar /> Presets</h3>
          <div className="preset-buttons">
            <button
              className={`preset-button ${activePreset === 'today' ? 'active' : ''}`}
              onClick={() => handlePresetClick('today')}
            >
              Today
            </button>
            <button
              className={`preset-button ${activePreset === 'yesterday' ? 'active' : ''}`}
              onClick={() => handlePresetClick('yesterday')}
            >
              Yesterday
            </button>
            <button
              className={`preset-button ${activePreset === 'thisWeek' ? 'active' : ''}`}
              onClick={() => handlePresetClick('thisWeek')}
            >
              This Week
            </button>
            <button
              className={`preset-button ${activePreset === 'last7days' ? 'active' : ''}`}
              onClick={() => handlePresetClick('last7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`preset-button ${activePreset === 'thisMonth' ? 'active' : ''}`}
              onClick={() => handlePresetClick('thisMonth')}
            >
              This Month
            </button>
            <button
              className={`preset-button ${activePreset === 'last30days' ? 'active' : ''}`}
              onClick={() => handlePresetClick('last30days')}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <div className="filter-section">
          <h3><FiChevronLeft /> From - To <FiChevronRight /></h3>
          <div className="date-range">
            <div className="date-input-group">
              <label>Start Date</label>
              <input
                type="date"
                className="date-input"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset('custom');
                }}
              />
            </div>
            <div className="date-input-group">
              <label>End Date</label>
              <input
                type="date"
                className="date-input"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset('custom');
                }}
              />
            </div>
          </div>
        </div>

        <div className="filter-section">
          <h3><FiClock /> Time Range</h3>
          <div className="time-inputs">
            <div className="time-range">
              <label>Start Hour</label>
              <input
                type="range"
                min="0"
                max="24"
                value={hourStart}
                className="time-range-slider"
                onChange={(e) => setHourStart(parseInt(e.target.value))}
              />
              <span className="time-range-value">{hourStart}:00</span>
            </div>
            <div className="time-range">
              <label>End Hour</label>
              <input
                type="range"
                min="0"
                max="24"
                value={hourEnd}
                className="time-range-slider"
                onChange={(e) => setHourEnd(parseInt(e.target.value))}
              />
              <span className="time-range-value">{hourEnd}:00</span>
            </div>
          </div>
        </div>

        {error && <div className="time-filter-error">{error}</div>}

        <div className="filter-actions">
          <button className="reset-button" onClick={handleReset}>
            Reset
          </button>
          <button
            className="apply-button"
            onClick={handleApply}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="loading-icon" /> Loading...
              </>
            ) : (
              'Apply Filter'
            )}
          </button>
        </div>

        <div className="time-filter-footer">
          Filter will be applied to all events on the map
        </div>
      </div>
    </div>
  );
};

export default TimeFilter;
