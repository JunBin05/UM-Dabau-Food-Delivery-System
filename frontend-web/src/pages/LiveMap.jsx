import React from "react";

const preferredZones = [
  { name: "North Campus", demand: "High Demand", active: "12 Active", tone: "high" },
  { name: "Engineering Quad", demand: "Moderate", active: "5 Active", tone: "moderate" },
  { name: "South Dorms", demand: "Low Coverage", active: "1 Active", tone: "low" }
];

const mapPins = [
  { label: "Campus Cafe", type: "vendor", x: 24, y: 34, icon: "storefront" },
  { label: "Rider", type: "rider", x: 55, y: 49, icon: "delivery_dining" },
  { label: "Drop-off", type: "dropoff", x: 76, y: 67, icon: "location_on" }
];

export default function LiveMap({ role = "admin", onNavigate = () => {} }) {
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const pageTitle = isAdmin ? "Live Map" : isCustomer ? "Delivery Map" : "Map Tracker";
  const eyebrow = isAdmin ? "Admin live map" : isCustomer ? "Full route map" : "Route tracker";

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
          <span className="status-chip green">Live mock</span>
        </div>
      </section>

      <section className="live-map-dashboard" aria-label="Static UM-Dabau campus map mockup">
        <div className="live-map-texture"></div>
        <span className="map-route-primary"></span>
        <span className="map-route-secondary"></span>
        <span className="map-node node-a"></span>
        <span className="map-node node-b"></span>
        <span className="map-node node-c"></span>
        <span className="map-node node-d"></span>

        {mapPins.map((pin) => (
          <span
            className={`live-map-pin ${pin.type}`}
            key={pin.label}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            title={pin.label}
          >
            <span className="material-symbols-outlined">{pin.icon}</span>
            <small>{pin.label}</small>
          </span>
        ))}

        {isAdmin ? (
          <aside className="floating-map-card preferred-zones-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Dispatch zones</p>
                <h3>Preferred Zones</h3>
              </div>
              <span className="material-symbols-outlined">hub</span>
            </div>

            <div className="preferred-zone-list">
              {preferredZones.map((zone) => (
                <div className="preferred-zone-row" key={zone.name}>
                  <span className={`zone-dot ${zone.tone}`}></span>
                  <div>
                    <strong>{zone.name}</strong>
                    <small>{zone.demand}</small>
                  </div>
                  <b>{zone.active}</b>
                </div>
              ))}
            </div>

            <button className="primary-button rebalance-button" type="button">
              Rebalance Riders
            </button>
          </aside>
        ) : (
          <aside className="floating-map-card app-map-bottom-sheet">
            <div>
              <p className="eyebrow">{role === "rider" ? "Current job" : "Current delivery"}</p>
              <h3>{role === "rider" ? "Order #8842" : "Campus Cafe to you"}</h3>
              <span>{role === "rider" ? "Cafe Takdir to KK12, Block B" : "Rider is approaching Engineering Block C"}</span>
            </div>
            <div className="app-map-stats">
              <div>
                <strong>12m</strong>
                <small>ETA</small>
              </div>
              <div>
                <strong>1.2 km</strong>
                <small>Distance</small>
              </div>
              <span className="status-chip green">{role === "rider" ? "Accepted" : "Out for Delivery"}</span>
            </div>
          </aside>
        )}

        {isAdmin && (
          <section className="floating-map-card algorithm-status-card">
            <div>
              <span>Algorithm Status</span>
              <strong>Optimizing Routes</strong>
            </div>
            <div>
              <span>Active Nodes</span>
              <strong>1,204</strong>
            </div>
            <div>
              <span>Avg ETA</span>
              <strong>14m</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong>28</strong>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
