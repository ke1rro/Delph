import React from "react"; // Removed useState
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "../styles/PageLayout.css";

const PageLayout = ({ children, onPlusClick }) => {

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