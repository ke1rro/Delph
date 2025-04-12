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
import "../styles/Map.css";

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
  const [sidebarOpen, setSidebarOpen] = useState(false); // For editing existing event
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false); // For adding new event
  const [storage] = useState(() => new EventStorage());
  const navigate = useNavigate();
  const [isPickingLocationMode, setIsPickingLocationMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);

  // Helper function to update marker classes based on selection
  const updateMarkerSelectionClass = (currentMarkers, newSelectedEventId) => {
    return currentMarkers.map(marker => {
      const isSelected = marker.id === newSelectedEventId;
      const newClassName = `custom-icon ${isSelected ? 'selected' : ''}`;
      const newHtml = `<div class="event-icon ${isSelected ? 'selected' : ''}" style="width:40px;height:40px;">${marker.icon.options.html.match(/<svg.*<\/svg>/s)?.[0] || ''}</div>`; // Extract existing SVG

      // Avoid creating a new icon if class and html haven't changed
      if (marker.icon.options.className === newClassName && marker.icon.options.html === newHtml) {
        return marker;
      }

      return {
        ...marker,
        icon: L.divIcon({
          className: newClassName,
          html: newHtml,
          iconSize: [40, 40],
        }),
      };
    });
  };

  useEffect(() => {
    const client = new BridgeClient(storage);

    client.onclose = async () => {
      await navigate("/login");
    };

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
    };

    client.connect();

    const addMarker = async (event) => {
      console.log("Event added", event);

      if (
        events[event.id] &&
        events[event.id].timestamp === event.timestamp &&
        events[event.id].location.latitude === event.location.latitude &&
        events[event.id].location.longitude === event.location.longitude
      ) {
        console.log("Skipping duplicate event", event.id);
        return;
      }

      const svgString = await createEventSVG(event);
      setEvents((prev) => ({
        ...prev,
        [event.id]: event,
      }));

      const isSelected = event.id === selectedEventId;
      const icon = L.divIcon({
        className: `custom-icon ${isSelected ? "selected" : ""}`,
        html: `<div class="event-icon ${isSelected ? "selected" : ""}" style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => {
        const existingIndex = prevMarkers.findIndex((m) => m.id === event.id);
        if (existingIndex !== -1) {
          const updatedMarkers = [...prevMarkers];
          updatedMarkers[existingIndex] = {
            ...prevMarkers[existingIndex],
            position: { lat: event.location.latitude, lng: event.location.longitude },
            icon,
            event: event,
          };
          return updateMarkerSelectionClass(updatedMarkers, selectedEventId);
        }
        const newMarkers = [
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
        return updateMarkerSelectionClass(newMarkers, selectedEventId);
      });
    };
    storage.on("add", addMarker);

    const updateMarker = async (previous_event, event) => {
      if (
        previous_event.id === event.id &&
        previous_event.timestamp === event.timestamp &&
        previous_event.location.latitude === event.location.latitude &&
        previous_event.location.longitude === event.location.longitude
      ) {
        console.log("Skipping redundant update for event", event.id);
        return;
      }

      setEvents((prev) => ({
        ...prev,
        [event.id]: event,
      }));
      console.log("Event updated", previous_event, event);
      const svgString = await createEventSVG(event);
      const isSelected = event.id === selectedEventId;
      const icon = L.divIcon({
        className: `custom-icon ${isSelected ? "selected" : ""}`,
        html: `<div class="event-icon ${isSelected ? "selected" : ""}" style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40],
      });

      setMarkers((prevMarkers) => {
        let markerUpdated = false;
        let updatedMarkers = prevMarkers.map(marker => {
          if (marker.id === event.id || marker.id === previous_event.id) {
            markerUpdated = true;
            return {
              ...marker,
              id: event.id,
              position: { lat: event.location.latitude, lng: event.location.longitude },
              icon,
              event: event,
            };
          }
          return marker;
        });

        return updateMarkerSelectionClass(updatedMarkers, selectedEventId);
      });
    };
    storage.on("update", updateMarker);

    const removeMarker = async (event) => {
      console.log("Event removed", event);
      setEvents((prev) => {
        const newEvents = { ...prev };
        delete newEvents[event.id];
        return newEvents;
      });
      if (selectedEventId === event.id) {
        setSelectedEventId(null);
        setSidebarOpen(false);
      }

      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== event.id));
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

    return () => {};
  }, []);

  const handleMarkerClick = (eventId) => {
    console.log("Marker clicked:", eventId);
    console.log("Event data:", events[eventId]);
    setSelectedEventId(eventId);
    setSidebarOpen(true); // Open sidebar for editing
    setAddEventSidebarOpen(false); // Ensure add mode is off
    setMarkers(prevMarkers => updateMarkerSelectionClass(prevMarkers, eventId));
    handleTogglePickLocation(false); // Ensure picking mode is off
  };

  // Handler for the plus button click
  const handleAddEventClick = () => {
    setSelectedEventId(null); // Deselect any selected event
    setSidebarOpen(false); // Ensure edit mode is off
    setAddEventSidebarOpen(true); // Open sidebar for adding
    setMarkers(prevMarkers => updateMarkerSelectionClass(prevMarkers, null)); // Deselect markers visually
    handleTogglePickLocation(false); // Ensure picking mode is off
  };

  // Combined close handler
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setAddEventSidebarOpen(false);
    setSelectedEventId(null);
    handleTogglePickLocation(false); // Turn off picking mode when closing
    setMarkers(prevMarkers => updateMarkerSelectionClass(prevMarkers, null)); // Deselect markers visually
  };

  const handleEventUpdate = (updatedEvent) => {
    console.log("Event updated from sidebar, pushing to storage:", updatedEvent);
    storage.push(updatedEvent);
    // No need to close sidebar here, EventSidebar calls onClose after successful submit
  };

  const handleEventSubmit = (newEventData) => {
    console.log("New event submitted from sidebar:", newEventData);
    // Assuming the structure from EventSidebar's handleSubmit is correct
    // We might need to generate ID and timestamp here if not done in sidebar/API
    storage.push(newEventData);
    // No need to close sidebar here, EventSidebar calls onClose after successful submit
  };

  const handleTogglePickLocation = (isPicking) => {
    console.log("Toggling pick location mode:", isPicking);
    setIsPickingLocationMode(isPicking);
    if (!isPicking && !pickedCoords) { // Reset only if not just picked
        setPickedCoords(null);
    }
  };

  const handleLocationPicked = (coords) => {
    console.log("Location picked:", coords);
    setPickedCoords(coords);
    setIsPickingLocationMode(false); // Turn off picking mode automatically after picking
  };

  const MapClickHandler = () => {
    const map = useMapEvents({
      click: (e) => {
        if (isPickingLocationMode) {
          handleLocationPicked({ lat: e.latlng.lat, lng: e.latlng.lng });
        } else {
          // Close sidebar only if clicking outside a marker when sidebar is open
          if (sidebarOpen || addEventSidebarOpen) {
             handleCloseSidebar();
          }
        }
      },
    });

    useEffect(() => {
      const mapContainer = map.getContainer();
      if (isPickingLocationMode) {
        mapContainer.classList.add("crosshair-cursor");
      } else {
        mapContainer.classList.remove("crosshair-cursor");
      }
      return () => {
        mapContainer.classList.remove("crosshair-cursor");
      };
    }, [isPickingLocationMode, map]);

    return null;
  };

  // Determine if the sidebar should be open (either adding or editing)
  const isSidebarEffectivelyOpen = sidebarOpen || addEventSidebarOpen;
  // Determine which event to pass (null if adding)
  const eventForSidebar = addEventSidebarOpen ? null : events[selectedEventId];

  return (
    <PageLayout onPlusClick={handleAddEventClick}>
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
          isOpen={isSidebarEffectivelyOpen}
          onClose={handleCloseSidebar} // Use combined close handler
          onSubmit={handleEventSubmit} // Use specific submit handler for new events
          onUpdate={handleEventUpdate} // Use specific update handler for existing events
          selectedEvent={eventForSidebar} // Pass null when adding, event when editing
          onTogglePickLocation={handleTogglePickLocation} // Pass the handler
          pickedLocation={pickedCoords} // Pass picked coordinates
          isPickingLocation={isPickingLocationMode} // Pass picking mode status
        />
      </div>
    </PageLayout>
  );
};

export default Map;
