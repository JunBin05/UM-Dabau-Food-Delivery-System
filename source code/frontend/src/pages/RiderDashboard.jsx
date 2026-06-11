import React, { useEffect, useState } from "react";
import { fetchJson, postJson } from "../api/liveApi.js";
import DeliveryMapView, { DRIVER_STEP_MS } from "../components/DeliveryMapView.jsx";

function routeStorageKey(orderId) {
  return `um-dabau-tracking-start-${orderId}`;
}

function getStoredRouteStartTime(orderId) {
  // Reuse the same clock as customer tracking so both pages show the rider in the same place.
  if (!orderId) {
    return Date.now();
  }

  const storedStartTime = Number(window.localStorage.getItem(routeStorageKey(orderId)));
  if (Number.isFinite(storedStartTime) && storedStartTime > 0) {
    return storedStartTime;
  }

  const startTime = Date.now();
  window.localStorage.setItem(routeStorageKey(orderId), String(startTime));
  return startTime;
}

export default function RiderDashboard({ view = "riderMain" }) {
  const [summary, setSummary] = useState({ activeZones: [], earnings: 0, assignedOrder: {}, latestRoute: null, currentNode: "NODE_FSKTM" });
  const [locations, setLocations] = useState([]);
  const [routeStartTime, setRouteStartTime] = useState(0);
  const [simulationNow, setSimulationNow] = useState(Date.now());
  const [mapError, setMapError] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [message, setMessage] = useState("");

  const title = view === "riderZones" ? "Preferred Zones" : view === "riderAssigned" ? "Assigned Delivery" : "Rider Dashboard";
  const showSummary = view === "riderMain" || view === "riderZones";
  const showDelivery = view === "riderMain" || view === "riderAssigned";
  const showRouting = view === "riderMain";
  const showZoneManager = view === "riderZones";
  const order = summary.assignedOrder || {};
  const route = summary.latestRoute;
  const routeFinalIndex = Math.max((route?.path?.length || 1) - 1, 0);
  // The backend provides the RouteSummary; the UI only advances the rider marker along it.
  const routeDriverIndex = routeStartTime > 0
    ? Math.min(Math.max(Math.floor((simulationNow - routeStartTime) / DRIVER_STEP_MS), 0), routeFinalIndex)
    : 0;

  function loadSummary() {
    setMapError("");
    // Rider summary includes the assigned order, RiderHeap count, and latest Dijkstra route.
    fetchJson("/live/rider/summary")
      .then((data) => {
        setSummary(data);
        setRouteStartTime(data.latestRoute ? getStoredRouteStartTime(data.latestRoute.orderId) : 0);
        setSimulationNow(Date.now());
      })
      .catch((error) => {
        console.error("Failed to load rider summary:", error);
        setMapError("Could not load live routing data from the backend.");
      });

    fetchJson("/live/locations")
      .then(setLocations)
      .catch((error) => {
        console.error("Failed to load map locations:", error);
        setMapError("Could not load campus map locations from the backend.");
      });
  }

  function clockIn() {
    // Clock-in sends this rider back to the backend so RiderHeap can consider them for dispatch.
    postJson("/dispatch/rider/clock-in?distanceToRestaurant=1", {
      userId: "USR-002",
      fullName: "Rafiq Lim",
      email: "rafiq.lim@rider.umdabau.local",
      role: "Rider",
      status: "Active",
      available: true,
      currentNodeId: summary.currentNode
    })
      .then(() => {
        setIsOnline(true);
        setMessage("Rider pushed into RiderHeap.");
        loadSummary();
      })
      .catch((error) => {
        console.error("Failed to clock in rider:", error);
        setMessage("Clock-in failed.");
      });
  }

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (!route?.path || route.path.length <= 1 || routeDriverIndex >= routeFinalIndex) {
      return undefined;
    }

    // Advance the display marker only while the route is still in progress.
    const timer = window.setInterval(() => {
      setSimulationNow(Date.now());
    }, DRIVER_STEP_MS);

    return () => window.clearInterval(timer);
  }, [route, routeDriverIndex, routeFinalIndex]);

  return (
    <div className="page-stack rider-dashboard-page">
      <section className="page-heading rider-dashboard-heading">
        <div>
          <p className="eyebrow">Rider workspace</p>
          <h2>{title}</h2>
          <span>Live rider state from RiderHeap and latest dispatch route.</span>
        </div>
        <span className={`status-chip ${isOnline ? "green" : "amber"}`}>{isOnline ? "Online" : "Offline"}</span>
      </section>

      {showSummary && (
        <section className="rider-summary-grid">
          <article className="card rider-summary-card status-card">
            <div className="card-header">
              <h3>Status</h3>
              <button className={`rider-toggle ${isOnline ? "active" : ""}`} type="button" aria-pressed={isOnline} onClick={() => setIsOnline((current) => !current)}>
                <span></span>
              </button>
            </div>
            <strong>{isOnline ? "Online" : "Offline"}</strong>
            <p>{isOnline ? `${summary.availableRiders} rider(s) available in heap.` : "Paused from receiving orders."}</p>
            <button className="text-button rider-link-button" type="button" onClick={clockIn}>Clock In</button>
            {message && <p className="muted">{message}</p>}
          </article>

          <article className="card rider-summary-card">
            <div className="card-header"><h3>Current Node</h3><span className="material-symbols-outlined">my_location</span></div>
            <strong>{summary.currentNode}</strong>
            <p>Used as Dijkstra start node.</p>
          </article>

          <article className="card rider-summary-card">
            <div className="card-header"><h3>Active Zones</h3><span className="material-symbols-outlined">radar</span></div>
            <div className="rider-zone-pills">
              {summary.activeZones.map((zone) => <span key={zone}>{zone}</span>)}
            </div>
          </article>

          {view === "riderMain" && (
            <article className="card rider-summary-card rider-earnings-card">
              <div className="card-header"><h3>Today Earnings</h3><span className="material-symbols-outlined">account_balance_wallet</span></div>
              <strong>RM {Number(summary.earnings || 0).toFixed(2)}</strong>
              <p>Derived from latest route distance.</p>
            </article>
          )}
        </section>
      )}

      {showDelivery && (
        <section className={`rider-main-grid ${view === "riderAssigned" ? "assigned-focus" : ""}`}>
          <article className="card new-delivery-card">
            <div className="card-header">
              <div><p className="eyebrow">Assigned Delivery</p><h3>{order.id || "No active order"}</h3></div>
              <span className={`status-chip ${route ? "green" : "amber"}`}>{route ? "Route ready" : "Waiting"}</span>
            </div>

            <div className="delivery-route-block">
              <div className="delivery-route-point pickup">
                <span className="material-symbols-outlined">storefront</span>
                <div><small>Pickup</small><strong>{order.vendor || "Awaiting restaurant"}</strong><p>{route ? `${route.path?.length || 0} graph nodes` : "No route assigned"}</p></div>
              </div>
              <div className="delivery-route-point dropoff">
                <span className="material-symbols-outlined">location_on</span>
                <div><small>Drop-off</small><strong>{order.destination || "Awaiting customer node"}</strong><p>{order.status || "No active delivery"}</p></div>
              </div>
            </div>

            <div className="delivery-estimate-grid">
              <div><span>Estimated distance</span><strong>{route ? route.totalDistanceKm.toFixed(2) : "0.00"} km</strong></div>
              <div><span>Estimated payout</span><strong>RM {Number(summary.earnings || 0).toFixed(2)}</strong></div>
            </div>
          </article>

          {showRouting && (
            <article className="card live-routing-card">
              <div className="card-header"><h3>Live Routing</h3><span className={`status-chip ${route ? "green" : "amber"}`}>{route ? "Dijkstra route" : "Awaiting dispatch"}</span></div>
              <div className="rider-routing-map" aria-label="Live rider route map">
                <DeliveryMapView
                  dropoffNodeId={summary.dropoffNodeId}
                  emptyMessage={mapError || "No active route assigned yet"}
                  emptyTitle={mapError ? "Route unavailable" : "Awaiting dispatch"}
                  locations={locations}
                  pickupNodeId={summary.pickupNodeId}
                  routeDriverIndex={routeDriverIndex}
                  routeSummary={route}
                  showLocationsWhenNoRoute={false}
                />
              </div>
              <div className="rider-map-stats">
                <div><strong>{route ? Math.ceil(route.estimatedTimeMinutes) : 0}m</strong><small>ETA</small></div>
                <div><strong>{route ? route.totalDistanceKm.toFixed(2) : "0.00"} km</strong><small>Distance</small></div>
              </div>
            </article>
          )}
        </section>
      )}

      {showZoneManager && (
        <section className="card rider-zone-manager-card">
          <div className="card-header"><div><p className="eyebrow">Preferred zones</p><h3>Live Service Zones</h3></div></div>
          <div className="preferred-zone-selector">
            {summary.activeZones.map((zone) => (
              <button type="button" key={zone}>
                <span className="material-symbols-outlined">explore</span>
                <strong>{zone}</strong>
                <small>Available from backend location service</small>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
