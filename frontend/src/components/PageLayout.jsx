import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import EventSidebar from "./EventSidebar";
import "../styles/PageLayout.css";

const PageLayout = ({ children }) => {
  const [eventSidebarOpen, setEventSidebarOpen] = useState(false);

  const toggleEventSidebar = () => {
    setEventSidebarOpen(!eventSidebarOpen);
  };

  return (
    <div className="page-layout">
      <Sidebar onPlusClick={toggleEventSidebar} />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>

      <EventSidebar
        isOpen={eventSidebarOpen}
        onClose={() => setEventSidebarOpen(false)}
        onSubmit={(data) => console.log("Form submitted:", data)}
      />
    </div>
  );
};

export default PageLayout;