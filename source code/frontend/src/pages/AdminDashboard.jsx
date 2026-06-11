import React, { useEffect, useState } from "react";
import { fetchJson } from "../api/liveApi.js";

const emptyOverview = {
  stats: [],
  alerts: [],
  latestOrders: []
};

export default function AdminDashboard({ onNavigate }) {
  const [overview, setOverview] = useState(emptyOverview);

  useEffect(() => {
    // One overview call feeds the dashboard cards, alerts, and latest order table.
    fetchJson("/live/admin/overview")
      .then(setOverview)
      .catch((error) => console.error("Failed to load admin overview:", error));
  }, []);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h2>Operations Dashboard</h2>
          <span>Live data from OrderQueue, RiderHeap, restaurants, and users.</span>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate("order-monitoring")}>
          <span className="material-symbols-outlined">monitor_heart</span>
          View Monitoring
        </button>
      </section>

      <section className="stat-grid four admin-stat-grid">
        {/* These stats are prepared by the backend from the current live data structures. */}
        {overview.stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-icon material-symbols-outlined">{stat.icon}</span>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.change || stat.detail}</small>
          </article>
        ))}
      </section>

      <section className="content-grid two-one">
        <article className="card">
          <div className="card-header">
            <h3>Recent system alerts</h3>
            <span className="status-chip amber">{overview.alerts.length} alerts</span>
          </div>
          <div className="list-stack">
            {overview.alerts.map((alert) => (
              <div className={`alert-row ${alert.level}`} key={alert.title}>
                <span className="material-symbols-outlined">error</span>
                <div>
                  <strong>{alert.title}</strong>
                  <span>{alert.body}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>Quick links</h3>
          <div className="quick-links">
            <button type="button" onClick={() => onNavigate("user-management")}>
              <span className="material-symbols-outlined">group</span>
              User Management
            </button>
            <button type="button" onClick={() => onNavigate("restaurant-management")}>
              <span className="material-symbols-outlined">storefront</span>
              Restaurants
            </button>
            <button type="button" onClick={() => onNavigate("live-map")}>
              <span className="material-symbols-outlined">map</span>
              Live Map
            </button>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Latest orders</h3>
          <button className="text-button" type="button" onClick={() => onNavigate("order-monitoring")}>Open monitor</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Vendor</th><th>Rider</th><th>Status</th><th>Total</th></tr>
            </thead>
            <tbody>
              {overview.latestOrders.slice(0, 3).map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.vendor}</td>
                  <td>{order.rider}</td>
                  <td><span className="status-chip blue">{order.status}</span></td>
                  <td>RM {Number(order.total || 0).toFixed(2)}</td>
                </tr>
              ))}
              {overview.latestOrders.length === 0 && (
                <tr>
                  <td colSpan="6">No queued orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
