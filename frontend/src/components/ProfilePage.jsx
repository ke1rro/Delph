import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { FiUser, FiMail, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../Api.js";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.auth.dashboard();

        if (response.status === 200 && response.data) {
          setUserData(response.data);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Unable to load profile data. Please try again later.");

        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      navigate("/login");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <div className="loading-spinner">Loading profile information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <div className="error-message">
            {error}
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FiUser size={60} />
            </div>
            <h2 className="profile-name">
              {userData.user_name} {userData.user_surname}
            </h2>
            <p className="profile-id">ID: {userData.user_id}</p>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <FiMail className="detail-icon" />
              <div className="detail-content">
                <h3>Email</h3>
                <p>{userData.email || "Not provided"}</p>
              </div>
            </div>
            <div className="detail-item">
              <FiUser className="detail-icon" />
              <div className="detail-content">
                <h3>First Name</h3>
                <p>{userData.user_name}</p>
              </div>
            </div>
            <div className="detail-item">
              <FiUser className="detail-icon" />
              <div className="detail-content">
                <h3>Last Name</h3>
                <p>{userData.user_surname}</p>
              </div>
            </div>
            {userData.is_admin && (
              <div className="detail-item">
                <FiShield className="detail-icon" />
                <div className="detail-content">
                  <h3>Role</h3>
                  <p>Administrator</p>
                </div>
              </div>
            )}
          </div>
          <div className="profile-actions">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
