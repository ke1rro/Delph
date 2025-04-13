import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiMap, FiUsers, FiAlertCircle, FiClock, FiCheckCircle, FiMapPin, FiInfo, FiRefreshCw } from "react-icons/fi";
import { Navbar } from "./Navbar";
import api from "../Api.js";
import EventStorage from "../api/EventStorage";
import BridgeClient from "../api/BridgeClient";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestEvents, setLatestEvents] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    users: 0,
    lastUpdate: new Date().toISOString(),
  });
  const navigate = useNavigate();

  // Create refs to keep instances across renders
  const storageRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.auth.dashboard();

        if (response.status === 200 && response.data) {
          setUserData(response.data);

          // In a real app, you would fetch actual statistics from an API
          // This is just mock data
          setStats({
            totalEvents: 128,
            activeEvents: 42,
            users: 15,
            lastUpdate: new Date().toISOString()
          });
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Unable to load dashboard data. Please try again later.");

        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Initialize EventStorage and BridgeClient only once
    if (!storageRef.current) {
      storageRef.current = new EventStorage();

      // Initialize the BridgeClient with our EventStorage
      clientRef.current = new BridgeClient(storageRef.current);

      // Handle WebSocket connection status
      clientRef.current.onclose = () => {
        setConnectionStatus("disconnected");
        console.log("WebSocket connection closed");
      };

      clientRef.current.onreconnect = () => {
        setConnectionStatus("reconnecting");
        console.log("Attempting to reconnect...");
      };

      // Connect to the WebSocket
      connectBridgeClient();
    }

    // Set up callbacks for new events
    const handleEventAdded = async (event) => {
      updateLatestEvents();
    };

    const handleEventUpdated = async (previousEvent, event) => {
      updateLatestEvents();
    };

    // Register event listeners
    storageRef.current.on("add", handleEventAdded);
    storageRef.current.on("update", handleEventUpdated);

    // Initial event fetch
    updateLatestEvents();

    // Cleanup function
    return () => {
      // Keep the client and storage instances but remove event listeners
      if (storageRef.current) {
        storageRef.current.on("add", () => {});
        storageRef.current.on("update", () => {});
      }
    };
  }, [navigate]);

  const connectBridgeClient = async () => {
    if (!clientRef.current) return;

    setConnectionStatus("connecting");

    try {
      await clientRef.current.connect();
      setConnectionStatus("connected");
      console.log("Successfully connected to BridgeClient");
      updateLatestEvents();
    } catch (error) {
      console.error("Failed to connect to BridgeClient:", error);
      setConnectionStatus("error");
    }
  };

  const updateLatestEvents = () => {
    if (!storageRef.current) return;

    const allEvents = storageRef.current.get();

    // Sort events by timestamp (newest first)
    const sortedEvents = [...allEvents].sort((a, b) => b.timestamp - a.timestamp);

    // Take the first 5 non-duplicate events (based on entity type)
    const uniqueEvents = [];
    const seenTypes = new Set();

    for (const event of sortedEvents) {
      const entityType = event.entity?.entity || 'unknown';

      if (!seenTypes.has(entityType) && uniqueEvents.length < 5) {
        seenTypes.add(entityType);
        uniqueEvents.push(event);
      }

      if (uniqueEvents.length >= 5) break;
    }

    setLatestEvents(uniqueEvents);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalEvents: allEvents.length,
      activeEvents: allEvents.filter(e => {
        // Consider events active if they're less than 24 hours old
        return Date.now() - e.timestamp < 24 * 60 * 60 * 1000;
      }).length,
      lastUpdate: new Date().toISOString()
    }));
  };

  const handleCardClick = (destination) => {
    navigate(destination);
  };

  const handleEventClick = (eventId) => {
    navigate(`/map?eventId=${eventId}`);
  };

  const handleReconnect = () => {
    connectBridgeClient();
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-spinner">Loading dashboard information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="error-message">
            {error}
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getEntityLabel = (entity) => {
    if (!entity || !entity.entity) return 'Unknown';

    // Convert "ground:civilian:vehicle" to "Civilian Vehicle"
    const parts = entity.entity.split(':');
    const label = parts.slice(1).map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');

    return label || parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {userData?.user_name || "User"}</h1>
            <p>Here's what's happening across your monitoring systems</p>
          </div>
          <div className="current-time">
            <FiClock /> {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon events-icon">
              <FiAlertCircle />
            </div>
            <div className="stat-details">
              <h3>Total Events</h3>
              <div className="stat-value">{stats.totalEvents}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-details">
              <h3>Active Events</h3>
              <div className="stat-value">{stats.activeEvents}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon users-icon">
              <FiUsers />
            </div>
            <div className="stat-details">
              <h3>Active Users</h3>
              <div className="stat-value">{stats.users}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-panels">
          <div className="panel quick-access">
            <h2>Quick Access</h2>
            <div className="quick-cards">
              <div className="quick-card" onClick={() => handleCardClick('/map')}>
                <FiMap />
                <span>Map View</span>
              </div>
              <div className="quick-card" onClick={() => handleCardClick('/profile')}>
                <FiUsers />
                <span>Profile</span>
              </div>
            </div>
          </div>

          <div className="panel latest-events">
            <h2>
              Latest Events
              {connectionStatus !== "connected" && (
                <span className={`connection-status ${connectionStatus}`}>
                  {connectionStatus === "connecting" && "Connecting..."}
                  {connectionStatus === "reconnecting" && "Reconnecting..."}
                  {connectionStatus === "disconnected" && "Disconnected"}
                  {connectionStatus === "error" && "Connection Error"}
                  {(connectionStatus === "disconnected" || connectionStatus === "error") && (
                    <button className="reconnect-button" onClick={handleReconnect}>
                      <FiRefreshCw />
                    </button>
                  )}
                </span>
              )}
            </h2>
            <div className="status-items">
              {latestEvents.length > 0 ? (
                latestEvents.map((event) => (
                  <div
                    key={event.id}
                    className="status-item event-item"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className={`status-icon ${event.entity?.affiliation === 'hostile' ? 'danger' : event.entity?.affiliation === 'friend' ? 'success' : 'warning'}`}>
                      <FiMapPin />
                    </div>
                    <div className="status-text">
                      <h4>{getEntityLabel(event.entity)}</h4>
                      <span>
                        {formatTimeAgo(event.timestamp)} •
                        {event.location ?
                          ` ${event.location.latitude.toFixed(2)}, ${event.location.longitude.toFixed(2)}` :
                          ' Unknown location'}
                      </span>
                    </div>
                  </div>
                ))
              ) : connectionStatus === "connected" ? (
                <div className="no-events-message">
                  <FiInfo /> No events found
                </div>
              ) : (
                <div className="no-events-message">
                  <FiInfo /> Waiting for connection...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h2>System Information</h2>
          <div className="activity-item">
            <div className="activity-icon update-icon">
              <FiInfo />
            </div>
            <div className="activity-details">
              <h4>Last System Update</h4>
              <p>{formatDate(stats.lastUpdate)}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-footer">
          <p>DELTA MONITOR v1.0 — Last refreshed: {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
