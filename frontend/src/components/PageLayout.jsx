import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "../styles/PageLayout.css";

const PageLayout = ({ children, onPlusClick, onTimeFilterClick }) => {
  return (
    <div className="page-layout">
      {/* Pass onTimeFilterClick down to Sidebar */}
      <Sidebar
        onPlusClick={onPlusClick}
        onTimeFilterClick={onTimeFilterClick}
      />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
