import React, { useState } from 'react';
import { FiClock, FiCalendar, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/TimeFilterStyles.css';

const TimeFilter = ({ isOpen, onClose }) => {
  const [activePreset, setActivePreset] = useState('today');
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState('2024-06-18');
  const [hourStart, setHourStart] = useState(0);
  const [hourEnd, setHourEnd] = useState(24);

  const handlePresetClick = (preset) => {
    setActivePreset(preset);

    // In a real implementation, we would calculate the actual dates based on the preset
    switch(preset) {
      case 'today':
        setStartDate('2024-06-18');
        setEndDate('2024-06-18');
        break;
      case 'yesterday':
        setStartDate('2024-06-17');
        setEndDate('2024-06-17');
        break;
      case 'thisWeek':
        setStartDate('2024-06-12');
        setEndDate('2024-06-18');
        break;
      case 'last7days':
        setStartDate('2024-06-11');
        setEndDate('2024-06-18');
        break;
      case 'thisMonth':
        setStartDate('2024-06-01');
        setEndDate('2024-06-18');
        break;
      case 'last30days':
        setStartDate('2024-05-19');
        setEndDate('2024-06-18');
        break;
      default:
        break;
    }
  };

  const handleApply = () => {
    // In a real implementation, this would apply the filter
    onClose();
  };

  const handleReset = () => {
    setActivePreset('today');
    setStartDate('2024-06-18');
    setEndDate('2024-06-18');
    setHourStart(0);
    setHourEnd(24);
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

        <div className="filter-actions">
          <button className="reset-button" onClick={handleReset}>
            Reset
          </button>
          <button className="apply-button" onClick={handleApply}>
            Apply Filter
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
