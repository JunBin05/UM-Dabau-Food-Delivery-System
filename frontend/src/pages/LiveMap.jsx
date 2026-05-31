import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchJson, postJson } from "../api/liveApi.js";

const markerIcons = {
  driver: L.divIcon({
    className: "delivery-map-marker driver-marker",
    html: '<span class="material-symbols-outlined">two_wheeler</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  cafe: L.divIcon({
    className: "delivery-map-marker cafe-marker",
    html: '<span class="material-symbols-outlined">restaurant</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  user: L.divIcon({
    className: "delivery-map-marker user-marker",
    html: '<span class="material-symbols-outlined">person_pin_circle</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  location: L.divIcon({
    className: "delivery-map-marker location-marker",
    html: '<span class="material-symbols-outlined">location_on</span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  })
};
const DRIVER_STEP_MS = 1400;

function trackingStorageKey(orderId) {
  return `um-dabau-tracking-start-${orderId}`;
}

function getStoredStartTime(orderId) {
  if (!orderId) {
    return Date.now();
  }

  const key = trackingStorageKey(orderId);
  const storedStartTime = Number(window.localStorage.getItem(key));
  if (Number.isFinite(storedStartTime) && storedStartTime > 0) {
    return storedStartTime;
  }

  const startTime = Date.now();
  window.localStorage.setItem(key, String(startTime));
  return startTime;
}

export default function LiveMap({ role = "admin", onNavigate = () => {} }) {
  const [locations, setLocations] = useState([]);
  const [activeRiders, setActiveRiders] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [overview, setOverview] = useState({ stats: [], alerts: [] });
  const [dispatchStatus, setDispatchStatus] = useState("");
  const [spawnNodeId, setSpawnNodeId] = useState("NODE_FSKTM");
  const [spawnCount, setSpawnCount] = useState(1);
  const [spawnStatus, setSpawnStatus] = useState("");
  const [routeStartTime, setRouteStartTime] = useState(0);
  const [simulationNow, setSimulationNow] = useState(Date.now());
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const pageTitle = isAdmin ? "Live Map" : isCustomer ? "Delivery Map" : "Map Tracker";
  const eyebrow = isAdmin ? "Admin live map" : isCustomer ? "Full route map" : "Route tracker";
  const routePositions = useMemo(() => routeSummary?.path?.map((node) => [node.latitude, node.longitude]) || [], [routeSummary]);
  const routeFinalIndex = Math.max((routeSummary?.path?.length || 1) - 1, 0);
  const routeDriverIndex = routeStartTime > 0
    ? Math.min(Math.max(Math.floor((simulationNow - routeStartTime) / DRIVER_STEP_MS), 0), routeFinalIndex)
    : 0;
  const routeStart = routeSummary?.path?.[routeDriverIndex];
  const routePickup = routeSummary?.path?.find((node) => node.nodeId === overview.pickupNodeId)
    || routeSummary?.path?.find((node) => node.nodeId?.includes("CAFE") || node.nodeId?.includes("FOOD") || node.nodeId?.includes("CENTRAL") || node.nodeId?.includes("ZUS"));
  const routeEnd = routeSummary?.path?.find((node) => node.nodeId === overview.dropoffNodeId)
    || routeSummary?.path?.[routeSummary.path.length - 1];

  function loadMapData() {
    fetchJson("/live/locations")
      .then((data) => {
        setLocations(data);
        if (data.length > 0 && !data.some((location) => location.nodeId === spawnNodeId)) {
          setSpawnNodeId(data[0].nodeId);
        }
      })
      .catch((error) => console.error("Failed to load live locations:", error));
    fetchJson("/live/admin/overview")
      .then((data) => {
        setOverview(data);
        setActiveRiders(data.activeRiders || []);
        if (data.latestRoute) {
          setRouteSummary(data.latestRoute);
          setRouteStartTime(getStoredStartTime(data.latestRoute.orderId));
          setSimulationNow(Date.now());
        }
      })
      .catch((error) => console.error("Failed to load map overview:", error));
  }

  function assignNextDelivery() {
    setDispatchStatus("Assigning nearest rider...");
    postJson("/dispatch/assign")
      .then((summary) => {
        setRouteSummary(summary);
        setDispatchStatus(`Order ${summary.orderId} assigned to ${summary.assignedRiderId}.`);
        return fetchJson("/live/admin/overview");
      })
      .then((data) => {
        setOverview(data);
        setActiveRiders(data.activeRiders || []);
        if (data.latestRoute) {
          setRouteSummary(data.latestRoute);
          setRouteStartTime(getStoredStartTime(data.latestRoute.orderId));
          setSimulationNow(Date.now());
        }
      })
      .catch((error) => {
        console.error("Failed to assign delivery:", error);
        setDispatchStatus("No pending order/rider, or route could not be calculated.");
      });
  }

  function spawnDrivers() {
    const count = Math.max(1, Math.min(Number(spawnCount) || 1, 25));
    setSpawnStatus("Spawning simulation riders...");

    postJson("/dispatch/riders/spawn", { nodeId: spawnNodeId, count })
      .then((result) => {
        setSpawnStatus(`${result.spawnedCount} rider(s) spawned at ${result.spawnNodeId}.`);
        return fetchJson("/live/admin/overview");
      })
      .then((data) => {
        setOverview(data);
        setActiveRiders(data.activeRiders || []);
      })
      .catch((error) => {
        console.error("Failed to spawn riders:", error);
        setSpawnStatus("Could not spawn riders. Please check the backend.");
      });
  }

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    if (!routeSummary?.path || routeSummary.path.length <= 1 || routeDriverIndex >= routeFinalIndex) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSimulationNow(Date.now());
    }, DRIVER_STEP_MS);

    return () => window.clearInterval(timer);
  }, [routeDriverIndex, routeFinalIndex, routeSummary]);

  return (
    <div className="page-stack map-page">
      <section className="page-heading map-page-heading compact-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{pageTitle}</h2>
        </div>
        <div className="map-heading-actions">
          {isCustomer && (
            <button className="secondary-button" type="button" onClick={() => onNavigate("order-tracking")}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Order Tracking
            </button>
          )}
          <span className="status-chip green">Live Map Active</span>
          {isAdmin && (
            <button className="primary-button" type="button" onClick={assignNextDelivery}>
              <span className="material-symbols-outlined">route</span>
              Assign Next Order
            </button>
          )}
        </div>
      </section>

      <section className="live-map-dashboard" style={{ position: "relative", height: "100%", minHeight: "600px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <MapContainer center={[3.1209, 101.6521]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            {!routeSummary && locations.map((location) => (
              <Marker key={location.id} icon={markerIcons.location} position={[location.latitude, location.longitude]}>
                <Popup>
                  <strong>{location.name}</strong><br />
                  <small style={{ color: "gray" }}>{location.nodeId}</small>
                </Popup>
              </Marker>
            ))}
            {!routeSummary && activeRiders.filter((rider) => rider.latitude && rider.longitude).map((rider) => (
              <Marker key={rider.userId} icon={markerIcons.driver} position={[rider.latitude, rider.longitude]}>
                <Popup>
                  <strong>{rider.fullName}</strong><br />
                  <small>{rider.currentNodeId} - active in RiderHeap</small>
                </Popup>
              </Marker>
            ))}
            {routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ color: "#16a34a", weight: 6, opacity: 0.86 }} />}
            {routeStart && (
              <Marker icon={markerIcons.driver} position={[routeStart.latitude, routeStart.longitude]}>
                <Popup><strong>Driver</strong><br /><small>{routeStart.name}</small></Popup>
              </Marker>
            )}
            {routePickup && (
              <Marker icon={markerIcons.cafe} position={[routePickup.latitude, routePickup.longitude]}>
                <Popup><strong>Cafe pickup</strong><br /><small>{routePickup.name}</small></Popup>
              </Marker>
            )}
            {routeEnd && (
              <Marker icon={markerIcons.user} position={[routeEnd.latitude, routeEnd.longitude]}>
                <Popup><strong>User location</strong><br /><small>{routeEnd.name}</small></Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>
          {isAdmin ? (
            <aside className="floating-map-card preferred-zones-card" style={{ pointerEvents: "auto" }}>
              <div className="card-header">
                <div><p className="eyebrow">Dispatch zones</p><h3>Live Operations</h3></div>
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div className="active-rider-summary">
                <span className="material-symbols-outlined">two_wheeler</span>
                <div>
                  <strong>{activeRiders.length} active rider(s)</strong>
                  <small>{routeSummary ? "Hidden while a delivery route is active" : "Showing RiderHeap positions on the map"}</small>
                </div>
              </div>
              <div className="map-spawn-controls">
                <label>
                  <span>Spawn at</span>
                  <select value={spawnNodeId} onChange={(event) => setSpawnNodeId(event.target.value)}>
                    {locations.map((location) => (
                      <option value={location.nodeId} key={location.nodeId}>{location.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Drivers</span>
                  <input min="1" max="25" type="number" value={spawnCount} onChange={(event) => setSpawnCount(event.target.value)} />
                </label>
                <button className="secondary-button full" type="button" onClick={spawnDrivers}>
                  <span className="material-symbols-outlined">person_add</span>
                  Spawn Drivers
                </button>
                {spawnStatus && <p className="muted">{spawnStatus}</p>}
              </div>
              {dispatchStatus && <p className="muted">{dispatchStatus}</p>}
              {routeSummary && (
                <div className="preferred-zone-row">
                  <span className="zone-dot high"></span>
                  <div>
                    <strong>{routeSummary.orderId}</strong>
                    <small>{routeSummary.totalDistanceKm.toFixed(2)} km route</small>
                  </div>
                  <b>{Math.ceil(routeSummary.estimatedTimeMinutes)}m</b>
                </div>
              )}
              <div className="preferred-zone-list">
                {overview.stats.map((stat) => (
                  <div className="preferred-zone-row" key={stat.label}>
                    <span className="zone-dot moderate"></span>
                    <div><strong>{stat.label}</strong><small>{stat.detail}</small></div>
                    <b>{stat.value}</b>
                  </div>
                ))}
              </div>
            </aside>
          ) : (
            <aside className="floating-map-card app-map-bottom-sheet" style={{ pointerEvents: "auto" }}>
              <div>
                <p className="eyebrow">{role === "rider" ? "Current job" : "Current delivery"}</p>
                <h3>{routeSummary ? `Order ${routeSummary.orderId}` : "Awaiting dispatch"}</h3>
                <span>{routeSummary ? `${routeSummary.path?.length || 0} graph nodes on route` : "No active RouteSummary yet"}</span>
              </div>
              <div className="app-map-stats">
                <div><strong>{routeSummary ? Math.ceil(routeSummary.estimatedTimeMinutes) : 0}m</strong><small>ETA</small></div>
                <div><strong>{routeSummary ? routeSummary.totalDistanceKm.toFixed(2) : "0.00"} km</strong><small>Distance</small></div>
                <span className="status-chip green">{role === "rider" ? "Assigned" : "Out for Delivery"}</span>
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
