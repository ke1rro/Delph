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

  // Helper to convert human date to Unix timestamp (seconds)
  const dateToUnixSeconds = (dateString) => {
    if (!dateString) return "";
    return Math.floor(new Date(dateString).getTime() / 1000).toString();
  };

  // Helper to convert Unix timestamp (seconds) to human-readable date
  const unixSecondsToDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toISOString().substring(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  // Handle date input changes
  const handleStartDateChange = (e) => {
    const dateValue = e.target.value;
    setStartTimestamp(dateToUnixSeconds(dateValue));
  };

  const handleEndDateChange = (e) => {
    const dateValue = e.target.value;
    setEndTimestamp(dateToUnixSeconds(dateValue));
  };

  // Handle timestamp input changes directly
  const handleStartTimestampChange = (e) => {
    setStartTimestamp(e.target.value);
  };

  const handleEndTimestampChange = (e) => {
    setEndTimestamp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Convert 10-digit (seconds) to 13-digit (milliseconds) timestamps
      const startMillis = startTimestamp ? parseInt(startTimestamp) * 1000 : null;
      const endMillis = endTimestamp ? parseInt(endTimestamp) * 1000 : null;

      // Call the API to filter events
      const filterParams = {
        start_timestamp: startMillis,
        end_timestamp: endMillis
      };

      const historicalEvents = await Api.history.filterEvents(filterParams);

      // Notify parent component that filter was applied
      if (onFilterApplied) {
        onFilterApplied(historicalEvents, { start: startTimestamp, end: endTimestamp });
      }

      // Save active filter for display
      setActiveFilter({
        start: startTimestamp ? new Date(startMillis).toLocaleString() : "earliest",
        end: endTimestamp ? new Date(endMillis).toLocaleString() : "latest"
      });

      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error filtering events:", error);
      setError("Failed to apply time filter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStartTimestamp("");
    setEndTimestamp("");
    setActiveFilter(null);
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
              className="timestamp-input"
              placeholder="Unix timestamp (seconds)"
              value={startTimestamp}
              onChange={handleStartTimestampChange}
            />
          </div>
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
              className="timestamp-input"
              placeholder="Unix timestamp (seconds)"
              value={endTimestamp}
              onChange={handleEndTimestampChange}
            />
          </div>
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
          <button type="submit" className="submit-button" disabled={isLoading}>
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
