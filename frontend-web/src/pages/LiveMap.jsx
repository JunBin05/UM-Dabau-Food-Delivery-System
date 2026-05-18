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

export default function LiveMap({ role = "admin" }) {
  return (
    <div className="page-stack map-page">
      <section className="page-heading map-page-heading compact-heading">
        <div>
          <p className="eyebrow">{role === "admin" ? "Admin live map" : "Route tracker"}</p>
          <h2>{role === "admin" ? "Live Map" : "Map Tracker"}</h2>
        </div>
        <span className="status-chip green">Live mock</span>
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
      </section>
    </div>
  );
}
