import React, { useEffect, useState } from "react";
import { fetchJson } from "../api/liveApi.js";
import DeliveryMapView, { DRIVER_STEP_MS } from "../components/DeliveryMapView.jsx";

function trackingStorageKey(orderId) {
  return `um-dabau-tracking-start-${orderId}`;
}

function getStoredStartTime(orderId) {
  // Store the route start time locally so refreshing does not restart the rider animation.
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
  const [routeStartTime, setRouteStartTime] = useState(0);
  const [simulationNow, setSimulationNow] = useState(Date.now());
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const pageTitle = isAdmin ? "Live Map" : isCustomer ? "Delivery Map" : "Map Tracker";
  const eyebrow = isAdmin ? "Admin live map" : isCustomer ? "Full route map" : "Route tracker";
  const routeFinalIndex = Math.max((routeSummary?.path?.length || 1) - 1, 0);
  // RouteSummary.path is already calculated by the backend graph; this only selects the visible step.
  const routeDriverIndex = routeStartTime > 0
    ? Math.min(Math.max(Math.floor((simulationNow - routeStartTime) / DRIVER_STEP_MS), 0), routeFinalIndex)
    : 0;

  function loadMapData() {
    // Map markers and the latest route come from backend live endpoints, not frontend mock data.
    fetchJson("/live/locations")
      .then(setLocations)
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

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    if (!routeSummary?.path || routeSummary.path.length <= 1 || routeDriverIndex >= routeFinalIndex) {
      return undefined;
    }

    // Keep the rider marker moving while the active route still has remaining nodes.
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
        </div>
      </section>

      <section className="live-map-dashboard" style={{ position: "relative", height: "100%", minHeight: "600px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          {/* The map component is shared by admin, rider, and customer views. */}
          <DeliveryMapView
            activeRiders={activeRiders}
            dropoffNodeId={overview.dropoffNodeId}
            locations={locations}
            pickupNodeId={overview.pickupNodeId}
            routeDriverIndex={routeDriverIndex}
            routeSummary={routeSummary}
          />
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}>
          {isAdmin ? (
            <aside className="floating-map-card preferred-zones-card admin-map-overview-card" style={{ pointerEvents: "auto" }}>
              <div className="card-header">
                <div><p className="eyebrow">Admin overview</p><h3>Live Operations</h3></div>
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div className="active-rider-summary">
                <span className="material-symbols-outlined">two_wheeler</span>
                <div>
                  <strong>{activeRiders.length} active rider(s)</strong>
                  <small>{routeSummary ? "Showing active route from Dijkstra" : "Showing live backend map locations"}</small>
                </div>
              </div>
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
              {!routeSummary && (
                <div className="preferred-zone-row">
                  <span className="zone-dot low"></span>
                  <div>
                    <strong>No active route</strong>
                    <small>Campus markers remain visible while waiting for dispatch</small>
                  </div>
                  <b>{locations.length}</b>
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
              {overview.alerts?.length > 0 && (
                <div className="admin-map-alert-list">
                  {overview.alerts.map((alert) => (
                    <div className={`admin-map-alert ${alert.level || "info"}`} key={`${alert.title}-${alert.body}`}>
                      <strong>{alert.title}</strong>
                      <small>{alert.body}</small>
                    </div>
                  ))}
                </div>
              )}
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
