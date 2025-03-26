import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "./PageLayout";
import BridgeClient from "../bridge/BridgeClient";
import EventStorage from "../bridge/EventStorage";

const Map = () => {
  const storage = new EventStorage()
  const client = new BridgeClient("ws://localhost:8003/api/bridge/messages", storage);

  storage.on("add", (event) => {
    console.log("Event added", event);
  });

  storage.on("update", (previous_event, event) => {
    console.log("Event updated", previous_event, event);
  });

  storage.on("remove", (event) => {
    console.log("Event removed", event);
  });

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
