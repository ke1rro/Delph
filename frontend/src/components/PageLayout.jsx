import React from "react";
import "../styles/PageLayout.css";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import PropTypes from "prop-types";

const PageLayout = ({ children, onPlusClick, onTimeFilterClick, onSymbolLegendClick, onMapLayersClick }) => {
  return (
    <div className="page-layout">
      <Sidebar
        onPlusClick={onPlusClick}
        onTimeFilterClick={onTimeFilterClick}
        onSymbolLegendClick={onSymbolLegendClick}
        onMapLayersClick={onMapLayersClick}
      />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node,
  onPlusClick: PropTypes.func,
  onTimeFilterClick: PropTypes.func,
  onSymbolLegendClick: PropTypes.func,
  onMapLayersClick: PropTypes.func
};

export default PageLayout;
