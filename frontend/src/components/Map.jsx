import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "./PageLayout";
import BridgeClient from "../api/BridgeClient";
import EventStorage from "../api/EventStorage";
import ms from "milsymbol";

let sidcData;

async function createEventSVG(event) {
    if(sidcData == null) {
        sidcData = await (await fetch("/sidc.json")).json();
    }

    let sidc = sidcData.entity[event.entity.entity];
    if (sidc == null) {
        sidc = sidcData.entity["ground"];
    }
    let affiliation = sidcData.affiliation[event.entity.affiliation];
    let status = sidcData.status[event.entity.status];

    sidc = sidc.replace("@", affiliation).replace("#", status);

    return new ms.Symbol(sidc).asSVG()
}

const Map = () => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const storage = new EventStorage()
    const client = new BridgeClient(storage);


    const addMarker = async (event) => {
      console.log("Event added", event);
      const svgString = await createEventSVG(event);
      const icon = L.divIcon({
        className: "custom-icon",
        html: `<div style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => [
        ...prevMarkers,
        { position: {
            lat: event.location.latitude,
            lng: event.location.longitude,
        }, icon },
      ]);
    };

    storage.on("add", addMarker);

    storage.on("update", async (previous_event, event) => {
        console.log("Event updated", previous_event, event);
    });

    storage.on("remove", async (event) => {
        console.log("Event removed", event);
    });
  }, []);

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
          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position} icon={marker.icon} />
          ))}
        </MapContainer>
      </div>
    </PageLayout>
  );
};

export default Map;
