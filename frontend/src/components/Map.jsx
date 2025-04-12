import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "./PageLayout";
import BridgeClient from "../api/BridgeClient";
import EventStorage from "../api/EventStorage";
import ms from "milsymbol";
import SidcDataService from "../utils/SidcDataService";
import EventSidebar from "./EventSidebar";
import "../styles/EventSidebar.css";

async function createEventSVG(event) {
  const sidcDataService = SidcDataService.getInstance();
  const sidcData = await sidcDataService.getData();

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
  const [events, setEvents] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storage] = useState(() => new EventStorage());
  const navigate = useNavigate();

  useEffect(() => {
    const client = new BridgeClient(storage);

    client.onclose = async () => {
      await navigate("/login");
    }

    client.onreconnect = async () => {
      while (true) {
        try {
          await client.connect();
          console.log("Successfully reconnected...");
          break;
        } catch (error) {
          console.error("Reconnection failed, retrying in 5 seconds...", error);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    client.connect();

    const addMarker = async (event) => {
      console.log("Event added", event);
      const svgString = await createEventSVG(event);
      setEvents(prev => ({
        ...prev,
        [event.id]: event
      }));

      const icon = L.divIcon({
        className: `custom-icon ${selectedEventId === event.id ? 'selected' : ''}`,
        html: `<div class="event-icon ${selectedEventId === event.id ? 'selected' : ''}" style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => {
        const existingIndex = prevMarkers.findIndex(m => m.id === event.id);
        if (existingIndex !== -1) {
          // Marker for this event already exists; skip or update as needed
          return prevMarkers;
        }
        return [
          ...prevMarkers,
          {
            id: event.id,
            position: {
              lat: event.location.latitude,
              lng: event.location.longitude,
            },
            icon,
            event: event,
          },
        ];
      });
    };
    storage.on("add", addMarker);

    const updateMarker = async (previous_event, event) => {
      setEvents(prev => ({
        ...prev,
        [event.id]: event
      }));
      console.log("Event updated", previous_event, event);
      const svgString = await createEventSVG(event);
      const icon = L.divIcon({
        className: `custom-icon ${selectedEventId === event.id ? 'selected' : ''}`,
        html: `<div class="event-icon ${selectedEventId === event.id ? 'selected' : ''}" style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => {
        // Check if marker with new ID already exists
        const existingIndex = prevMarkers.findIndex(m => m.id === event.id);
        if (existingIndex !== -1) {
          // If found, update it
          const updatedMarkers = [...prevMarkers];
          updatedMarkers[existingIndex] = {
            ...prevMarkers[existingIndex],
            position: { lat: event.location.latitude, lng: event.location.longitude },
            icon,
            event: event,
          };
          return updatedMarkers;
        }

        // Otherwise, find old marker by previous_event.id
        const oldIndex = prevMarkers.findIndex(m => m.id === previous_event.id);
        if (oldIndex !== -1) {
          const updatedMarkers = [...prevMarkers];
          updatedMarkers[oldIndex] = {
            ...prevMarkers[oldIndex],
            id: event.id,
            position: { lat: event.location.latitude, lng: event.location.longitude },
            icon,
            event: event,
          };
          return updatedMarkers;
        }
        return prevMarkers;
      });
    };
    storage.on("update", updateMarker);

    const removeMarker = async (event) => {
      console.log("Event removed", event);
      setEvents(prev => {
        const newEvents = {...prev};
        delete newEvents[event.id];
        return newEvents;
      });
      if (selectedEventId === event.id) {
        setSelectedEventId(null);
        setSidebarOpen(false);
      }

      setMarkers((prevMarkers) =>
        prevMarkers.filter(
          (marker) => marker.id !== event.id
        )
      );
    };
    storage.on("remove", removeMarker);

    const loadInitialEvents = async () => {
      try {
        const allEvents = storage.get();
        console.log("Initial events:", allEvents);

        for (const event of allEvents) {
          await addMarker(event);
        }
      } catch (error) {
        console.error("Error loading initial events:", error);
      }
    };

    loadInitialEvents();

    return () => {
    };
  }, [selectedEventId]);
  const handleMarkerClick = (eventId) => {
    console.log("Marker clicked:", eventId);
    console.log("Event data:", events[eventId]);
    setSelectedEventId(eventId);
    setSidebarOpen(true);
  };
  const handleEventUpdate = (updatedEvent) => {
    // Ensure updatedEvent has the full structure: { id, timestamp, ttl, source, location, velocity, entity }
    console.log("Event updated from sidebar, pushing to storage:", updatedEvent);
    storage.push(updatedEvent);
  };

  useEffect(() => {
    if (!markers.length) return;

    const updateMarkerIcons = async () => {
      const updatedMarkers = await Promise.all(markers.map(async (marker) => {
        const svgString = await createEventSVG(marker.event);
        const icon = L.divIcon({
          className: `custom-icon ${selectedEventId === marker.id ? 'selected' : ''}`,
          html: `<div class="event-icon ${selectedEventId === marker.id ? 'selected' : ''}" style="width:40px;height:40px;">${svgString}</div>`,
          iconSize: [40, 40],
        });

        return {
          ...marker,
          icon
        };
      }));

      setMarkers(updatedMarkers);
    };

    updateMarkerIcons();
  }, [selectedEventId]);
  const MapClickHandler = () => {
    useMapEvents({
      click: () => {
        setSelectedEventId(null);
        setSidebarOpen(false);
      }
    });
    return null;
  };

  return (
    <PageLayout>
      <div className="map-container">
        <MapContainer
          center={[55.7558, 37.6173]}
          zoom={10}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={marker.icon}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(marker.id);
                },
              }}
            />
          ))}
        </MapContainer>

        <EventSidebar
          isOpen={sidebarOpen}
          onClose={() => {
            setSidebarOpen(false);
            setSelectedEventId(null);
          }}
          onSubmit={(data) => console.log("Form submitted:", data)}
          onUpdate={handleEventUpdate}
          selectedEvent={events[selectedEventId]}
        />
      </div>
    </PageLayout>
  );
};

export default Map;
