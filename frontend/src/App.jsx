import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Map from "./components/Map";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/map" element={<Map />} />
    </Routes>
  );
};

export default App;
