import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import "../styles/PageLayout.css";

const PageLayout = ({ children }) => {
  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
