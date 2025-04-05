import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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
  const [events, setEvents] = useState({}); // Store all events by ID
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storage] = useState(() => new EventStorage());

  useEffect(() => {
    const client = new BridgeClient(storage);

    const addMarker = async (event) => {
      console.log("Event added", event);
      const svgString = await createEventSVG(event);

      // Store the event in our events state
      setEvents(prev => ({
        ...prev,
        [event.id]: event
      }));

      const icon = L.divIcon({
        className: `custom-icon ${selectedEventId === event.id ? 'selected' : ''}`,
        html: `<div class="event-icon ${selectedEventId === event.id ? 'selected' : ''}" style="width:40px;height:40px;">${svgString}</div>`,
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
          event: event, // Store the full event data with the marker
        },
      ]);
    };
    storage.on("add", addMarker);

    const updateMarker = async (previous_event, event) => {
      console.log("Event updated", previous_event, event);

      // Update the event in our events state
      setEvents(prev => ({
        ...prev,
        [event.id]: event
      }));

      const svgString = await createEventSVG(event);
      const icon = L.divIcon({
        className: `custom-icon ${selectedEventId === event.id ? 'selected' : ''}`,
        html: `<div class="event-icon ${selectedEventId === event.id ? 'selected' : ''}" style="width:40px;height:40px;">${svgString}</div>`,
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
            event: event, // Store the full event data with the marker
          };
          return updatedMarkers;
        }
        return prevMarkers;
      });
    };
    storage.on("update", updateMarker);

    const removeMarker = async (event) => {
      console.log("Event removed", event);

      // Remove the event from our events state
      setEvents(prev => {
        const newEvents = {...prev};
        delete newEvents[event.id];
        return newEvents;
      });

      // If the removed event was selected, clear selection
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

    // Load all events when component mounts
    const loadInitialEvents = async () => {
      try {
        const allEvents = storage.get();
        console.log("Initial events:", allEvents);

        // Process each event as if it was just added
        for (const event of allEvents) {
          await addMarker(event);
        }
      } catch (error) {
        console.error("Error loading initial events:", error);
      }
    };

    loadInitialEvents();

    return () => {
      // Clean up event listeners if needed
    };
  }, [selectedEventId]);

  // Handle marker click to select an event and open sidebar
  const handleMarkerClick = (eventId) => {
    console.log("Marker clicked:", eventId);
    setSelectedEventId(eventId);
    setSidebarOpen(true);
  };

  // Handle event update from sidebar
  const handleEventUpdate = (updatedEvent) => {
    console.log("Event updated from sidebar:", updatedEvent);
    storage.push(updatedEvent);
  };

  // Update all markers when selectedEventId changes to reflect selection state
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

  // Custom component to intercept map clicks to deselect events
  const MapClickHandler = () => {
    useMapEvents({
      click: () => {
        // Clear selection when clicking on the map (not on a marker)
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
