import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "./PageLayout";

const Map = () => {
  return (
    <PageLayout>
      <div className="map-container">
        <MapContainer
          center={[50.4501, 30.5234]}
          zoom={10}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </MapContainer>
      </div>
    </PageLayout>
  );
};

export default Map;
