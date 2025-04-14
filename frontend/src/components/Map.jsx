import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageLayout from "./PageLayout";
import BridgeClient from "../api/BridgeClient";
import EventStorage from "../api/EventStorage";
import ms from "milsymbol";
import SidcDataService from "../utils/SidcDataService";
import EventSidebar from "./EventSidebar";
import TimeFilter from "./TimeFilter"; // Import TimeFilter component
import { FiClock } from "react-icons/fi"; // Add missing FiClock import
import "../styles/EventSidebar.css";
import "../styles/Map.css";

async function createEventSVG(event) {
  // Add validation to prevent errors with malformed events
  if (!event || !event.entity || !event.entity.entity) {
    console.warn("Invalid event structure for SVG creation:", event);
    // Return a default SVG for invalid events
    return `<svg width="35" height="35" viewBox="0 0 35 35">
      <circle cx="17.5" cy="17.5" r="15" fill="#888" stroke="#444" stroke-width="2"/>
      <text x="17.5" y="22" text-anchor="middle" fill="white" font-size="16">?</text>
    </svg>`;
  }

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

// New component to handle map centering
const MapController = ({ events, selectedEventId, setSelectedEventId, setSidebarOpen }) => {
  const map = useMap();
  const location = useLocation();
  const initialCenterRef = useRef(false);

  useEffect(() => {
    // Parse eventId from URL if present
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get("eventId");

    if (eventId && events[eventId] && !initialCenterRef.current) {
      const event = events[eventId];
      // Center map on event coordinates
      if (event.location && event.location.latitude && event.location.longitude) {
        map.setView(
          [event.location.latitude, event.location.longitude],
          15, // Zoom level
          { animate: true }
        );
        // Select the event and open sidebar
        setSelectedEventId(eventId);
        setSidebarOpen(true);
        initialCenterRef.current = true;
      }
    }
  }, [events, location, map, setSelectedEventId, setSidebarOpen]);

  return null;
};

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [events, setEvents] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For editing existing event
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false); // For adding new event
  const [storage] = useState(() => new EventStorage());
  const navigate = useNavigate();
  const location = useLocation();
  const [isPickingLocationMode, setIsPickingLocationMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);
  // Add state for TimeFilter
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);
  const [isTimeFilterActive, setIsTimeFilterActive] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(null);
  const [filterInfo, setFilterInfo] = useState(null); // Add state for filter info

  // Helper function to update marker classes based on selection
  const updateMarkerSelectionClass = (currentMarkers, newSelectedEventId) => {
    return currentMarkers.map((marker) => {
      const isSelected = marker.id === newSelectedEventId;
      const newClassName = `custom-icon ${isSelected ? "selected" : ""}`;
      const newHtml = `<div class="event-icon ${isSelected ? "selected" : ""}" style="width:40px;height:40px;">${marker.icon.options.html.match(/<svg.*<\/svg>/s)?.[0] || ""}</div>`; // Extract existing SVG

      // Avoid creating a new icon if class and html haven't changed
      if (marker.icon.options.className === newClassName && marker.icon.options.html === newHtml) {
        return marker;
      }

      return {
        ...marker,
        icon: L.divIcon({
          className: newClassName,
          html: newHtml,
          iconSize: [40, 40]
        })
      };
    });
  };

  // Extract addMarker as a callback function so it can be reused
  const addMarker = useCallback(async (event) => {
    console.log("Event added", event);

    // Skip if event is invalid
    if (!event || !event.id || !event.location ||
        typeof event.location.latitude !== 'number' ||
        typeof event.location.longitude !== 'number') {
      console.warn("Skipping invalid event:", event);
      return;
    }

    // Check for duplicates
    if (
      events[event.id] &&
      events[event.id].timestamp === event.timestamp &&
      events[event.id].location.latitude === event.location.latitude &&
      events[event.id].location.longitude === event.location.longitude
    ) {
      console.log("Skipping duplicate event", event.id);
      return;
    }

    // Ensure event has all required properties
    const validatedEvent = {
      ...event,
      entity: event.entity || {
        entity: "ground",
        affiliation: "unknown",
        status: "active"
      }
    };

    const svgString = await createEventSVG(validatedEvent);
    setEvents((prev) => ({
      ...prev,
      [event.id]: validatedEvent
    }));

    const isSelected = event.id === selectedEventId;
    const icon = L.divIcon({
      className: `custom-icon ${isSelected ? "selected" : ""}`,
      html: `<div class="event-icon ${isSelected ? "selected" : ""}" style="width:40px;height:40px;">${svgString}</div>`,
      iconSize: [40, 40]
    });

    setMarkers((prevMarkers) => {
      const existingIndex = prevMarkers.findIndex((m) => m.id === event.id);
      if (existingIndex !== -1) {
        const updatedMarkers = [...prevMarkers];
        updatedMarkers[existingIndex] = {
          ...prevMarkers[existingIndex],
          position: { lat: event.location.latitude, lng: event.location.longitude },
          icon,
          event: validatedEvent
        };
        return updateMarkerSelectionClass(updatedMarkers, selectedEventId);
      }
      const newMarkers = [
        ...prevMarkers,
        {
          id: event.id,
          position: {
            lat: event.location.latitude,
            lng: event.location.longitude
          },
          icon,
          event: validatedEvent
        }
      ];
      return updateMarkerSelectionClass(newMarkers, selectedEventId);
    });
  }, [events, selectedEventId]); // Include dependencies for the callback

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

    // Use the addMarker function defined outside
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
        [event.id]: event
      }));
      console.log("Event updated", previous_event, event);
      const svgString = await createEventSVG(event);
      const isSelected = event.id === selectedEventId;
      const icon = L.divIcon({
        className: `custom-icon ${isSelected ? "selected" : ""}`,
        html: `<div class="event-icon ${isSelected ? "selected" : ""}" style="width:40px;height:40px;">${svgString}</div>`,
        iconSize: [40, 40]
      });

      setMarkers((prevMarkers) => {
        let markerUpdated = false;
        let updatedMarkers = prevMarkers.map((marker) => {
          if (marker.id === event.id || marker.id === previous_event.id) {
            markerUpdated = true;
            return {
              ...marker,
              id: event.id,
              position: {
                lat: event.location.latitude,
                lng: event.location.longitude
              },
              icon,
              event: event
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
  }, [addMarker]); // Include addMarker in the dependencies

  const handleMarkerClick = (eventId) => {
    console.log("Marker clicked:", eventId);
    console.log("Event data:", events[eventId]);
    setSelectedEventId(eventId);
    setSidebarOpen(true); // Open sidebar for editing
    setAddEventSidebarOpen(false); // Ensure add mode is off
    setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, eventId));
    handleTogglePickLocation(false); // Ensure picking mode is off
  };

  // Handler for the plus button click
  const handleAddEventClick = () => {
    setSelectedEventId(null); // Deselect any selected event
    setSidebarOpen(false); // Ensure edit mode is off
    setAddEventSidebarOpen(true); // Open sidebar for adding
    setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, null)); // Deselect markers visually
    handleTogglePickLocation(false); // Ensure picking mode is off
  };

  // Combined close handler
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setAddEventSidebarOpen(false);
    setSelectedEventId(null);
    handleTogglePickLocation(false); // Turn off picking mode when closing
    setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, null)); // Deselect markers visually
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
    if (!isPicking && !pickedCoords) {
      // Reset only if not just picked
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
      }
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

  // Add handler for time filter click from the sidebar
  const handleTimeFilterClick = () => {
    setTimeFilterOpen(true);
  };

  // Improved handler for applying time filter
  const handleTimeFilterApplied = (events, filterState) => {
    if (events && events.length > 0 && filterState.isFiltered) {
      console.log('🔍 Applying filtered events:', events.length);
      console.log(`🕒 Time range: ${new Date(filterState.startTime).toLocaleString()} to ${new Date(filterState.endTime).toLocaleString()}`);

      // Clear all existing markers and events
      setMarkers([]);
      setEvents({});
      setSelectedEventId(null); // Deselect any selected event when filter changes

      // Store filter information for display
      setFilterInfo({
        startTime: new Date(filterState.startTime).toLocaleString(),
        endTime: new Date(filterState.endTime).toLocaleString(),
        eventCount: events.length
      });

      // Create map of filtered events with validation
      const eventMap = {};
      const validEvents = events.filter(event =>
        event &&
        event.id &&
        event.location &&
        typeof event.location.latitude === 'number' &&
        typeof event.location.longitude === 'number'
      );

      console.log(`✅ Found ${validEvents.length} valid events out of ${events.length}`);

      if (validEvents.length < events.length) {
        console.warn(`⚠️ Filtered out ${events.length - validEvents.length} invalid events`);
      }

      // Log information about each valid event
      console.group('📍 Events being added to map:');
      validEvents.forEach((event, index) => {
        if (index < 10) {  // Limit logging to first 10 events to avoid console spam
          console.log(`Event ${event.id}:`, {
            entity: event.entity?.entity || 'unknown',
            affiliation: event.entity?.affiliation || 'unknown',
            status: event.entity?.status || 'unknown',
            location: `${event.location.latitude.toFixed(4)}, ${event.location.longitude.toFixed(4)}`,
            timestamp: new Date(event.timestamp).toLocaleString()
          });
          // Add to event map
          eventMap[event.id] = event;
        } else if (index === 10) {
          console.log(`... and ${validEvents.length - 10} more events`);
          // Still add remaining events to map
          validEvents.slice(10).forEach(e => eventMap[e.id] = e);
        }
      });
      console.groupEnd();

      setEvents(eventMap);
      setIsTimeFilterActive(true);
      setFilteredEvents(validEvents);

      // Create markers for filtered events
      Promise.all(validEvents.map(event => addMarker(event)))
        .catch(err => console.error("Error creating filtered markers:", err));
    } else {
      // Reset filter state
      setFilterInfo(null);
      setFilteredEvents(null);
      setIsTimeFilterActive(false);
      setSelectedEventId(null); // Deselect any selected event when filter is reset

      // Reload all real-time events from storage
      const reloadEvents = async () => {
        console.log('🔄 Resetting filter, reloading real-time events');
        setMarkers([]); // Clear all existing markers
        setEvents({}); // Clear all existing events

        const allEvents = storage.get();
        console.log(`📊 Loading ${allEvents.length} events from local storage`);

        // Add all events from storage back to the map
        for (const event of allEvents) {
          await addMarker(event);
        }
      };

      reloadEvents();
    }
  };

  // Determine if the sidebar should be open (either adding or editing)
  const isSidebarEffectivelyOpen = sidebarOpen || addEventSidebarOpen;
  // Determine which event to pass (null if adding)
  const eventForSidebar = addEventSidebarOpen ? null : events[selectedEventId];

  return (
    <PageLayout
      onPlusClick={handleAddEventClick}
      onTimeFilterClick={handleTimeFilterClick}
      isFilterActive={isTimeFilterActive}
    >
      <div className="map-container">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
          <MapController
            events={events}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            setSidebarOpen={setSidebarOpen}
          />
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={marker.icon}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(marker.id);
                }
              }}
            />
          ))}

          {/* Add filter indicator overlay */}
          {isTimeFilterActive && filterInfo && (
            <div className="filter-indicator">
              <div className="filter-badge">
                <FiClock /> Time Filter Active
              </div>
              <div className="filter-details">
                {filterInfo.startTime} - {filterInfo.endTime}
                <div className="filter-count">{filterInfo.eventCount} events</div>
              </div>
            </div>
          )}
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

        {/* Add TimeFilter component */}
        <TimeFilter
          isOpen={timeFilterOpen}
          onClose={() => setTimeFilterOpen(false)}
          onFilterApplied={handleTimeFilterApplied}
        />
      </div>
    </PageLayout>
  );
};

export default Map;
