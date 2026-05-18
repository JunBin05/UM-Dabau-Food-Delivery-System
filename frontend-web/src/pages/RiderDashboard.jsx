import React, { useState } from "react";

const activeZones = ["KK12", "Library", "Central Eatery"];
const preferredZoneOptions = [
  { name: "KK12", demand: "High demand", eta: "8 min" },
  { name: "Library", demand: "Steady", eta: "11 min" },
  { name: "Central Eatery", demand: "Pickup hub", eta: "5 min" }
];

export default function RiderDashboard({ view = "riderMain" }) {
  const [isOnline, setIsOnline] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState("New delivery waiting for response");
  const [selectedZone, setSelectedZone] = useState("KK12");

  const title = view === "riderZones" ? "Preferred Zones" : view === "riderAssigned" ? "Assigned Delivery" : "Rider Dashboard";
  const showSummary = view === "riderMain" || view === "riderZones";
  const showDelivery = view === "riderMain" || view === "riderAssigned";
  const showRouting = view === "riderMain";
  const showZoneManager = view === "riderZones";

  return (
    <div className="page-stack rider-dashboard-page">
      <section className="page-heading rider-dashboard-heading">
        <div>
          <p className="eyebrow">Rider workspace</p>
          <h2>{title}</h2>
          <span>Local mock delivery controls for demonstration only.</span>
        </div>
        <span className="status-chip green">Live mock</span>
      </section>

      {showSummary && (
        <section className="rider-summary-grid">
          <article className="card rider-summary-card status-card">
            <div className="card-header">
              <h3>Status</h3>
              <button
                className={`rider-toggle ${isOnline ? "active" : ""}`}
                type="button"
                aria-pressed={isOnline}
                onClick={() => setIsOnline((current) => !current)}
              >
                <span></span>
              </button>
            </div>
            <strong>{isOnline ? "Online" : "Offline"}</strong>
            <p>{isOnline ? "Ready to receive orders." : "Paused from receiving orders."}</p>
          </article>

          <article className="card rider-summary-card">
            <div className="card-header">
              <h3>Current Node</h3>
              <span className="material-symbols-outlined">my_location</span>
            </div>
            <strong>FSKTM</strong>
            <p>Faculty of Computer Science</p>
            <button className="text-button rider-link-button" type="button">Update Location</button>
          </article>

          <article className="card rider-summary-card">
            <div className="card-header">
              <h3>Active Zones</h3>
              <span className="material-symbols-outlined">radar</span>
            </div>
            <div className="rider-zone-pills">
              {activeZones.map((zone) => (
                <span key={zone}>{zone}</span>
              ))}
            </div>
            <button className="text-button rider-link-button" type="button">Manage Zones</button>
          </article>
        </section>
      )}

      {showDelivery && (
        <section className={`rider-main-grid ${view === "riderAssigned" ? "assigned-focus" : ""}`}>
          <article className="card new-delivery-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">New Delivery Assigned</p>
              <h3>Order #8842</h3>
            </div>
            <span className="status-chip amber">{deliveryStatus}</span>
          </div>

          <div className="delivery-route-block">
            <div className="delivery-route-point pickup">
              <span className="material-symbols-outlined">storefront</span>
              <div>
                <small>Pickup</small>
                <strong>Cafe Takdir, Central Eatery</strong>
                <p>Ready in 5 mins &middot; 2 items</p>
              </div>
            </div>
            <div className="delivery-route-point dropoff">
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <small>Drop-off</small>
                <strong>KK12, Block B</strong>
                <p>Student Dormitory &middot; Call upon arrival</p>
              </div>
            </div>
          </div>

          <div className="delivery-estimate-grid">
            <div>
              <span>Estimated distance</span>
              <strong>1.2 km</strong>
            </div>
            <div>
              <span>Estimated payout</span>
              <strong>RM 4.50</strong>
            </div>
          </div>

          <div className="delivery-action-row">
            <button className="reject-delivery-button" type="button" onClick={() => setDeliveryStatus("Delivery rejected locally")}>
              Reject
            </button>
            <button className="primary-button accept-delivery-button" type="button" onClick={() => setDeliveryStatus("Delivery accepted locally")}>
              Accept Delivery
            </button>
          </div>
        </article>

          {showRouting && (
            <article className="card live-routing-card">
              <div className="card-header">
                <h3>Live Routing</h3>
                <span className="status-chip green">Traffic Light</span>
              </div>
              <div className="rider-routing-map" aria-label="Static rider route mockup">
                <span className="routing-road road-a"></span>
                <span className="routing-road road-b"></span>
                <span className="routing-line"></span>
                <span className="routing-pin vendor"><span className="material-symbols-outlined">storefront</span></span>
                <span className="routing-pin rider"><span className="material-symbols-outlined">delivery_dining</span></span>
                <span className="routing-pin dropoff"><span className="material-symbols-outlined">location_on</span></span>
                <div className="routing-traffic-badge">
                  <span></span>
                  Traffic Light
                </div>
              </div>
            </article>
          )}
        </section>
      )}

      {showZoneManager && (
        <section className="card rider-zone-manager-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Preferred zone selector</p>
              <h3>Manage Preferred Zones</h3>
            </div>
            <span className="status-chip green">{selectedZone} selected</span>
          </div>

          <div className="preferred-zone-selector">
            {preferredZoneOptions.map((zone) => (
              <button
                className={selectedZone === zone.name ? "selected" : ""}
                type="button"
                key={zone.name}
                onClick={() => setSelectedZone(zone.name)}
              >
                <span className="material-symbols-outlined">explore</span>
                <strong>{zone.name}</strong>
                <small>{zone.demand} &middot; {zone.eta} average ETA</small>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
