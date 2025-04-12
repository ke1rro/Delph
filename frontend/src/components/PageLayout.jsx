import React from "react"; // Removed useState
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
// Removed EventSidebar import
import "../styles/PageLayout.css";

// Accept onPlusClick prop from parent (Map.jsx)
const PageLayout = ({ children, onPlusClick }) => {
  // Removed eventSidebarOpen state and toggleEventSidebar function

  return (
    <div className="page-layout">
      {/* Pass onPlusClick down to the Sidebar */}
      <Sidebar onPlusClick={onPlusClick} />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>

      {/* Removed EventSidebar instance from here */}
    </div>
  );
};

export default PageLayout;