import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Map from "./components/Map";
import RegistrationPage from "./components/RegistrationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./components/ProfilePage";
import DashboardPage from "./components/DashboardPage";

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<RegistrationPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
      <Route path="/map" element={<ProtectedRoute element={<Map />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
