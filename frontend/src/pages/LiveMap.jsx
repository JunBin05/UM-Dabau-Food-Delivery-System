import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchJson, postJson } from "../api/liveApi.js";

export default function LiveMap({ role = "admin", onNavigate = () => {} }) {
  const [locations, setLocations] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [overview, setOverview] = useState({ stats: [], alerts: [] });
  const [dispatchStatus, setDispatchStatus] = useState("");
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const pageTitle = isAdmin ? "Live Map" : isCustomer ? "Delivery Map" : "Map Tracker";
  const eyebrow = isAdmin ? "Admin live map" : isCustomer ? "Full route map" : "Route tracker";
  const routePositions = useMemo(() => routeSummary?.path?.map((node) => [node.latitude, node.longitude]) || [], [routeSummary]);
  const routeStart = routeSummary?.path?.[0];
  const routeEnd = routeSummary?.path?.[routeSummary.path.length - 1];

  function loadMapData() {
    fetchJson("/live/locations")
      .then(setLocations)
      .catch((error) => console.error("Failed to load live locations:", error));
    fetchJson("/live/admin/overview")
      .then((data) => {
        setOverview(data);
        if (data.latestRoute) setRouteSummary(data.latestRoute);
      })
      .catch((error) => console.error("Failed to load map overview:", error));
  }

  function assignNextDelivery() {
    setDispatchStatus("Assigning nearest rider...");
    postJson("/dispatch/assign")
      .then((summary) => {
        setRouteSummary(summary);
        setDispatchStatus(`Order ${summary.orderId} assigned to ${summary.assignedRiderId}.`);
      })
      .catch((error) => {
        console.error("Failed to assign delivery:", error);
        setDispatchStatus("No pending order/rider, or route could not be calculated.");
      });
  }

  useEffect(() => {
    loadMapData();
  }, []);

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
            {locations.map((location) => (
              <Marker key={location.id} position={[location.latitude, location.longitude]}>
                <Popup>
                  <strong>{location.name}</strong><br />
                  <small style={{ color: "gray" }}>{location.nodeId}</small>
                </Popup>
              </Marker>
            ))}
            {routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ color: "#16a34a", weight: 6, opacity: 0.86 }} />}
            {routeStart && (
              <Marker position={[routeStart.latitude, routeStart.longitude]}>
                <Popup><strong>Rider start</strong><br /><small>{routeStart.name}</small></Popup>
              </Marker>
            )}
            {routeEnd && (
              <Marker position={[routeEnd.latitude, routeEnd.longitude]}>
                <Popup><strong>Customer drop-off</strong><br /><small>{routeEnd.name}</small></Popup>
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
