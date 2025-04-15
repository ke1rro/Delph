import React, { useState } from "react";
import { FiX, FiClock, FiCalendar, FiFilter, FiCheck, FiAlertTriangle } from "react-icons/fi";
import "../styles/TimeFilterSidebar.css";
import "../styles/SidebarStyles.css";
import Api from "../Api";

const TimeFilterSidebar = ({ isOpen, onClose, onFilterApplied }) => {
  const [startTimestamp, setStartTimestamp] = useState("");
  const [endTimestamp, setEndTimestamp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [invalidStartFormat, setInvalidStartFormat] = useState(false);
  const [invalidEndFormat, setInvalidEndFormat] = useState(false);

  const dateToUnixSeconds = (dateString) => {
    if (!dateString) return "";
    return Math.floor(new Date(dateString).getTime() / 1000).toString();
  };

  const unixSecondsToDate = (timestamp) => {
    if (!timestamp) return "";
    const tsNum = Number(timestamp);
    if (isNaN(tsNum) || tsNum < 0 || tsNum > 4102444800) {
      return "";
    }
    try {
      const date = new Date(tsNum * 1000);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().substring(0, 16);
    } catch (e) {
      console.error("Invalid timestamp:", timestamp);
      return "";
    }
  };

  const handleStartDateChange = (e) => {
    const dateValue = e.target.value;
    setStartTimestamp(dateToUnixSeconds(dateValue));
    setInvalidStartFormat(false);
  };

  const handleEndDateChange = (e) => {
    const dateValue = e.target.value;
    setEndTimestamp(dateToUnixSeconds(dateValue));
    setInvalidEndFormat(false);
  };

  const handleStartTimestampChange = (e) => {
    const value = e.target.value;
    setStartTimestamp(value);
    if (value && (!/^\d+$/.test(value) || Number(value) < 0)) {
      setInvalidStartFormat(true);
    } else {
      setInvalidStartFormat(false);
    }
  };

  const handleEndTimestampChange = (e) => {
    const value = e.target.value;
    setEndTimestamp(value);

    if (value && (!/^\d+$/.test(value) || Number(value) < 0)) {
      setInvalidEndFormat(true);
    } else {
      setInvalidEndFormat(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (invalidStartFormat || invalidEndFormat) {
      setError("Invalid timestamp format. Please enter valid UNIX timestamps (seconds).");
      return;
    }

    setIsLoading(true);

    try {
      let startSeconds = null;
      let endSeconds = null;

      if (startTimestamp) {
        if (!/^\d+$/.test(startTimestamp)) {
          throw new Error("Start timestamp must be a positive number");
        }
        startSeconds = parseInt(startTimestamp);
      }

      if (endTimestamp) {
        if (!/^\d+$/.test(endTimestamp)) {
          throw new Error("End timestamp must be a positive number");
        }
        endSeconds = parseInt(endTimestamp);
      }

      const filterParams = {
        start_timestamp: startSeconds,
        end_timestamp: endSeconds
      };

      const historicalEvents = await Api.history.filterEvents(filterParams);

      if (onFilterApplied) {
        onFilterApplied(historicalEvents, { start: startTimestamp, end: endTimestamp });
      }
      setActiveFilter({
        start: startTimestamp
          ? new Date(parseInt(startTimestamp) * 1000).toLocaleString()
          : "earliest",
        end: endTimestamp ? new Date(parseInt(endTimestamp) * 1000).toLocaleString() : "latest"
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error filtering events:", error);
      setError(error.message || "Failed to apply time filter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStartTimestamp("");
    setEndTimestamp("");
    setActiveFilter(null);
    setInvalidStartFormat(false);
    setInvalidEndFormat(false);
    setError(null);
    if (onFilterApplied) {
      onFilterApplied(null, null);
    }
    setSuccess(false);
  };

  return (
    <div className={`sidebar-container time-filter-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>
          <FiClock /> Time Filter
        </h2>
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
      </div>

      {activeFilter && (
        <div className="active-filter-indicator">
          <FiCheck className="filter-icon" />
          <div className="filter-details">
            <span>Filter active:</span>
            <strong>{activeFilter.start}</strong> to <strong>{activeFilter.end}</strong>
          </div>
          <button className="clear-filter-btn" onClick={clearFilters}>
            <FiX />
          </button>
        </div>
      )}

      <form className="filter-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <FiCalendar /> Start Time
          </label>
          <div className="time-input-container">
            <input
              type="datetime-local"
              className="date-input"
              value={unixSecondsToDate(startTimestamp)}
              onChange={handleStartDateChange}
            />
            <input
              type="text"
              className={`timestamp-input ${invalidStartFormat ? "invalid-input" : ""}`}
              placeholder="Unix timestamp (seconds)"
              value={startTimestamp}
              onChange={handleStartTimestampChange}
            />
          </div>
          {invalidStartFormat && <small className="error-text">Invalid timestamp format</small>}
          <small>Enter either date or Unix timestamp (seconds)</small>
        </div>

        <div className="form-group">
          <label>
            <FiCalendar /> End Time
          </label>
          <div className="time-input-container">
            <input
              type="datetime-local"
              className="date-input"
              value={unixSecondsToDate(endTimestamp)}
              onChange={handleEndDateChange}
            />
            <input
              type="text"
              className={`timestamp-input ${invalidEndFormat ? "invalid-input" : ""}`}
              placeholder="Unix timestamp (seconds)"
              value={endTimestamp}
              onChange={handleEndTimestampChange}
            />
          </div>
          {invalidEndFormat && <small className="error-text">Invalid timestamp format</small>}
          <small>Enter either date or Unix timestamp (seconds)</small>
        </div>

        {error && (
          <div className="error-message">
            <FiAlertTriangle /> {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <FiCheck /> Filter applied successfully
          </div>
        )}

        <div className="filter-actions">
          <button type="button" className="clear-button" onClick={clearFilters}>
            Clear
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || invalidStartFormat || invalidEndFormat}
          >
            {isLoading ? (
              "Filtering..."
            ) : (
              <>
                <FiFilter /> Apply Filter
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeFilterSidebar;
