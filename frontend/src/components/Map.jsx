import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "./PageLayout";
import BridgeClient from "../api/BridgeClient";
import EventStorage from "../api/EventStorage";
import ms from "milsymbol";

let sidcData;

async function createEventSVG(event) {
  if (sidcData == null) {
    sidcData = await (await fetch("/sidc.json")).json();
  }

  let sidc = sidcData.entity[event.entity.entity];
  if (sidc == null) {
    sidc = sidcData.entity["ground"];
  }
  let affiliation = sidcData.affiliation[event.entity.affiliation];
  let status = sidcData.status[event.entity.status];

  sidc = sidc.replace("@", affiliation).replace("#", status);

  return new ms.Symbol(sidc, { size: 35 }).asSVG();
}

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storage = new EventStorage();
    const client = new BridgeClient(storage);

    client.onclose = async () => {
      await navigate("/login");
    }

    client.onreconnect = async () => {
      while (true) {
        try {
          await client.connect();
          console.log("Successfuly reconnected...");
          break;
        } catch (error) {
          console.error("Reconnection failed, retrying in 5 seconds...", error);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    client.connect();

    const addMarker = async (event) => {
    //   console.log("Event added", event);
      const svgString = await createEventSVG(event);
      const icon = L.divIcon({
        className: "custom-icon",
        html: `<div style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          id: event.id,
          position: {
            lat: event.location.latitude,
            lng: event.location.longitude,
          },
          icon,
        },
      ]);
    };
    storage.on("add", addMarker);

    const updateMarker = async (previous_event, event) => {
    //   console.log("Event updated", previous_event, event);
      const svgString = await createEventSVG(event);
      const icon = L.divIcon({
        className: "custom-icon",
        html: `<div style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => {
        const index = prevMarkers.findIndex(
          (marker) => marker.id === previous_event.id
        );

        if (index !== -1) {
          const updatedMarkers = [...prevMarkers];
          updatedMarkers[index] = {
            id: event.id,
            position: {
              lat: event.location.latitude,
              lng: event.location.longitude,
            },
            icon,
          };
          return updatedMarkers;
        }
        return prevMarkers;
      });
    }
    storage.on("update", updateMarker);

    const removeMarker = async (event) => {
    //   console.log("Event removed", event);
      setMarkers((prevMarkers) =>
        prevMarkers.filter(
          (marker) => marker.id !== event.id
        )
      );
    };
    storage.on("remove", removeMarker);
  }, []);

  return (
    <PageLayout>
      <div className="map-container">
        <MapContainer
          // add moscow coordinates
          center={[55.7558, 37.6173]}
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
