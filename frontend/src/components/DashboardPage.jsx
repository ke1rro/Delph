import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMap, FiUsers, FiAlertCircle, FiClock, FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";
import { Navbar } from "./Navbar";
import api from "../Api.js";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    users: 0,
    lastUpdate: new Date().toISOString(),
  });
  const navigate = useNavigate();

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
  }, [navigate]);

  const handleCardClick = (destination) => {
    navigate(destination);
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

          <div className="panel system-status">
            <h2>System Status</h2>
            <div className="status-items">
              <div className="status-item">
                <div className="status-icon success">
                  <FiCheckCircle />
                </div>
                <div className="status-text">
                  <h4>Database</h4>
                  <span>Online</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon success">
                  <FiCheckCircle />
                </div>
                <div className="status-text">
                  <h4>API Services</h4>
                  <span>Online</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon warning">
                  <FiInfo />
                </div>
                <div className="status-text">
                  <h4>Map Tiles</h4>
                  <span>Degraded Performance</span>
                </div>
              </div>
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
