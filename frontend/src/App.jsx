import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Map from "./components/Map";
import RegistrationPage from "./components/RegistrationPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<RegistrationPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/map" element={<ProtectedRoute element={<Map />} />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
