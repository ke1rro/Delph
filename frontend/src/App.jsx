import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Map from "./components/Map";
import RegistrationPage from "./components/RegistrationPage";

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<RegistrationPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/map" element={<Map />} />
    </Routes>
  );
};

export default App;
