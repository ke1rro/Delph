import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "../styles/PageLayout.css";

const PageLayout = ({
  children,
  onPlusClick,
  onTimeFilterClick, // Make sure this prop is received
  isFilterActive
}) => {
  return (
    <div className="page-layout">
      <Sidebar
        onPlusClick={onPlusClick}
        onTimeFilterClick={onTimeFilterClick} // Pass it to Sidebar
        isFilterActive={isFilterActive}
      />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
