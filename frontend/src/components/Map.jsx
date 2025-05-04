import React, { useEffect, useState, useRef } from "react";
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
import TimeFilterSidebar from "./TimeFilterSidebar";
import LegendPopup from "./LegendPopup";
import MapTypeSelector from "./MapTypeSelector";
import "../styles/EventSidebar.css";
import "../styles/TimeFilterSidebar.css";
import "../styles/Map.css";
import "../styles/MapTypeSelector.css";

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

const MapController = ({ events, selectedEventId, setSelectedEventId, setSidebarOpen }) => {
  const map = useMap();
  const location = useLocation();
  const initialCenterRef = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get("eventId");

    if (eventId && events[eventId] && !initialCenterRef.current) {
      const event = events[eventId];
      if (event.location && event.location.latitude && event.location.longitude) {
        map.setView([event.location.latitude, event.location.longitude], 15, { animate: true });
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
  const [historicalMarkers, setHistoricalMarkers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false);
  const [timeFilterSidebarOpen, setTimeFilterSidebarOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [storage] = useState(() => new EventStorage());
  const navigate = useNavigate();
  const location = useLocation();
  const [isPickingLocationMode, setIsPickingLocationMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [filterParams, setFilterParams] = useState(null);

  // Add state for map type
  const [mapType, setMapType] = useState("satellite");
  const [mapTypeSelectorVisible, setMapTypeSelectorVisible] = useState(true);

  const mapTilerKey = "gDZXLN81ddWbbYqBpQOZ";

  // Map type configurations
  const mapTiles = {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    satellite: {
      url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${mapTilerKey}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    streets: {
      url: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mapTilerKey}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    basic: {
      url: `https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=${mapTilerKey}`,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  const updateMarkerSelectionClass = (currentMarkers, newSelectedEventId) => {
    return currentMarkers.map((marker) => {
      const isSelected = marker.id === newSelectedEventId;
      const newClassName = `custom-icon ${isSelected ? "selected" : ""}`;
      const newHtml = `<div class="event-icon ${isSelected ? "selected" : ""}" style="width:40px;height:40px;">${marker.icon.options.html.match(/<svg.*<\/svg>/s)?.[0] || ""}</div>`;

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
        [event.id]: event
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
            event: event
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
            event: event
          }
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
  }, []);
  const createHistoricalMarkers = async (historicalEvents) => {
    if (!historicalEvents || !Array.isArray(historicalEvents) || historicalEvents.length === 0) {
      setHistoricalMarkers([]);
      return;
    }

    try {
      const newMarkers = [];

      for (const event of historicalEvents) {
        if (!event?.location?.latitude || !event?.location?.longitude) {
          console.log("Skipping historical event without location:", event);
          continue;
        }

        const svgString = await createEventSVG(event);
        const icon = L.divIcon({
          className: "custom-icon historical",
          html: `<div class="event-icon historical" style="width:40px;height:40px;">${svgString}</div>`,
          iconSize: [40, 40]
        });

        newMarkers.push({
          id: event.id,
          position: {
            lat: event.location.latitude,
            lng: event.location.longitude
          },
          icon,
          event: event,
          isHistorical: true
        });
      }

      setHistoricalMarkers(newMarkers);
    } catch (error) {
      console.error("Error creating historical markers:", error);
    }
  };

  const handleMarkerClick = (eventId, isHistorical = false) => {
    console.log(`${isHistorical ? "Historical" : "Live"} marker clicked:`, eventId);

    let eventData;
    if (isHistorical) {
      eventData = historicalMarkers.find((marker) => marker.id === eventId)?.event;
    } else {
      eventData = events[eventId];
    }

    console.log("Event data:", eventData);

    setSelectedEventId(eventId);
    setTimeFilterSidebarOpen(false);
    setAddEventSidebarOpen(false);
    setSidebarOpen(true);

    if (isHistorical) {
      setHistoricalMarkers((prevMarkers) => {
        return prevMarkers.map((marker) => ({
          ...marker,
          icon: L.divIcon({
            className: `custom-icon historical ${marker.id === eventId ? "selected" : ""}`,
            html: `<div class="event-icon historical ${marker.id === eventId ? "selected" : ""}" style="width:40px;height:40px;">${marker.icon.options.html.match(/<svg.*<\/svg>/s)?.[0] || ""}</div>`,
            iconSize: [40, 40]
          })
        }));
      });
    } else {
      setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, eventId));
    }

    handleTogglePickLocation(false);
  };

  const handleAddEventClick = () => {
    setSelectedEventId(null);
    setSidebarOpen(false);
    setTimeFilterSidebarOpen(false)
    setAddEventSidebarOpen(true);
    setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, null)); // Deselect markers visually
    handleTogglePickLocation(false);
  };

  const handleTimeFilterClick = () => {
    setSelectedEventId(null);
    setSidebarOpen(false)
    setAddEventSidebarOpen(false)
    setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, null)); // Deselect markers visually
    setTimeFilterSidebarOpen(true);
  };

  const handleSymbolLegendClick = () => {
    setIsLegendOpen(true);
  };

  const handleCloseTimeFilterSidebar = () => {
    setTimeFilterSidebarOpen(false);
  };

  const handleFilterApplied = (historicalEvents, filterParams) => {
    if (!historicalEvents) {
      setHistoricalMarkers([]);
      setIsHistoricalMode(false);
      setFilterParams(null);
      return;
    }
    setFilterParams(filterParams);
    setIsHistoricalMode(true);
    createHistoricalMarkers(historicalEvents);

    console.log("Filters applied:", filterParams);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setAddEventSidebarOpen(false);
    setSelectedEventId(null);
    handleTogglePickLocation(false);
    setMarkers((prevMarkers) => updateMarkerSelectionClass(prevMarkers, null));
  };

  const handleEventUpdate = (updatedEvent) => {
    console.log("Event updated from sidebar, pushing to storage:", updatedEvent);
    storage.push(updatedEvent);
  };

  const handleEventSubmit = (newEventData) => {
    console.log("New event submitted from sidebar:", newEventData);
    storage.push(newEventData);
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
    setIsPickingLocationMode(false);
  };

  const MapClickHandler = () => {
    const map = useMapEvents({
      click: (e) => {
        if (isPickingLocationMode) {
          handleLocationPicked({ lat: e.latlng.lat, lng: e.latlng.lng });
        } else {
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

  const isSidebarEffectivelyOpen = sidebarOpen || addEventSidebarOpen;
  const eventForSidebar = addEventSidebarOpen
    ? null
    : isHistoricalMode && selectedEventId
      ? historicalMarkers.find((marker) => marker.id === selectedEventId)?.event
      : events[selectedEventId];

  // Toggle back to live mode
  const handleToggleLiveMode = () => {
    setIsHistoricalMode(false);
    setSelectedEventId(null);
    setSidebarOpen(false);
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
  };

  const toggleMapTypeSelector = () => {
    setMapTypeSelectorVisible(!mapTypeSelectorVisible);
  };

  return (
    <PageLayout
      onPlusClick={handleAddEventClick}
      onTimeFilterClick={handleTimeFilterClick}
      onSymbolLegendClick={handleSymbolLegendClick}
      onMapLayersClick={toggleMapTypeSelector}
    >
      <div className="map-container">
        {isHistoricalMode && (
          <div className="historical-mode-banner">
            <div className="historical-info">
              <span className="historical-icon">⏱️</span>
              <span>Viewing historical events</span>
              {filterParams && (
                <span className="filter-details">
                  {filterParams.start
                    ? new Date(parseInt(filterParams.start) * 1000).toLocaleString()
                    : "earliest"}
                  {" to "}
                  {filterParams.end
                    ? new Date(parseInt(filterParams.end) * 1000).toLocaleString()
                    : "latest"}
                  {filterParams.entities && filterParams.entities.length > 0 && (
                    <span className="entity-filter-badge"> • Entity Filters Active</span>
                  )}
                  {filterParams.statuses && filterParams.statuses.length > 0 && (
                    <span className="status-filter-badge"> • Status Filters Active</span>
                  )}
                </span>
              )}
            </div>
            <button className="live-toggle-button" onClick={handleToggleLiveMode}>
              Return to Live View
            </button>
          </div>
        )}

        <MapContainer
          center={[0, 0]}
          zoom={2}
          minZoom={2}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          worldCopyJump={true}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url={mapTiles[mapType].url}
            attribution={mapTiles[mapType].attribution}
          />
          <MapClickHandler />
          <MapController
            events={isHistoricalMode ? {} : events}
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Render either live or historical markers based on mode */}
          {!isHistoricalMode
            ? markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={marker.icon}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(marker.id, false);
                    }
                  }}
                />
              ))
            : historicalMarkers.map((marker) => (
                <Marker
                  key={`historical-${marker.id}`}
                  position={marker.position}
                  icon={marker.icon}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(marker.id, true);
                    }
                  }}
                />
              ))}
        </MapContainer>

        <MapTypeSelector
          selectedMapType={mapType}
          onSelectMapType={handleMapTypeChange}
          isVisible={mapTypeSelectorVisible}
        />

        <EventSidebar
          isOpen={isSidebarEffectivelyOpen}
          onClose={handleCloseSidebar}
          onSubmit={handleEventSubmit}
          onUpdate={handleEventUpdate}
          selectedEvent={eventForSidebar}
          onTogglePickLocation={handleTogglePickLocation}
          pickedLocation={pickedCoords}
          isPickingLocation={isPickingLocationMode}
          isHistoricalMode={isHistoricalMode}
        />

        <TimeFilterSidebar
          isOpen={timeFilterSidebarOpen}
          onClose={handleCloseTimeFilterSidebar}
          onFilterApplied={handleFilterApplied}
        />

        <LegendPopup
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        />
      </div>
    </PageLayout>
  );
};

export default Map;