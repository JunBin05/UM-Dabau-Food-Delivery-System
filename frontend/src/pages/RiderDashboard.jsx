import React, { useEffect, useState } from "react";
import { fetchJson, postJson } from "../api/liveApi.js";

export default function RiderDashboard({ view = "riderMain" }) {
  const [summary, setSummary] = useState({ activeZones: [], earnings: 0, assignedOrder: {}, latestRoute: null, currentNode: "NODE_FSKTM" });
  const [isOnline, setIsOnline] = useState(true);
  const [message, setMessage] = useState("");

  const title = view === "riderZones" ? "Preferred Zones" : view === "riderAssigned" ? "Assigned Delivery" : "Rider Dashboard";
  const showSummary = view === "riderMain" || view === "riderZones";
  const showDelivery = view === "riderMain" || view === "riderAssigned";
  const showRouting = view === "riderMain";
  const showZoneManager = view === "riderZones";
  const order = summary.assignedOrder || {};
  const route = summary.latestRoute;

  function loadSummary() {
    fetchJson("/live/rider/summary")
      .then(setSummary)
      .catch((error) => console.error("Failed to load rider summary:", error));
  }

  function clockIn() {
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
              <div className="card-header"><h3>Live Routing</h3><span className="status-chip green">Dijkstra</span></div>
              <div className="rider-routing-map" aria-label="Live rider route summary">
                <span className="routing-road road-a"></span>
                <span className="routing-road road-b"></span>
                <span className="routing-line"></span>
                <span className="routing-pin vendor"><span className="material-symbols-outlined">storefront</span></span>
                <span className="routing-pin rider"><span className="material-symbols-outlined">delivery_dining</span></span>
                <span className="routing-pin dropoff"><span className="material-symbols-outlined">location_on</span></span>
                <div className="routing-traffic-badge"><span></span>{route ? `${Math.ceil(route.estimatedTimeMinutes)} min ETA` : "No route"}</div>
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
