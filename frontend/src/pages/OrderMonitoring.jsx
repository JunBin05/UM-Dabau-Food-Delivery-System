import React, { useEffect, useMemo, useState } from "react";
import { fetchJson, postJson } from "../api/liveApi.js";

const filters = ["All", "Pending", "Dispatched"];

function getStatusTone(status) {
  if (status === "PENDING_DISPATCH") return "amber";
  if (status === "DELIVERED") return "green";
  return "blue";
}

export default function OrderMonitoring() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [monitoring, setMonitoring] = useState({ metrics: [], orders: [] });
  const [lastSync, setLastSync] = useState("Ready");

  function loadOrders() {
    return fetchJson("/live/orders")
      .then((data) => {
        setMonitoring(data);
        setLastSync("Synced with OrderQueue");
      })
      .catch((error) => {
        console.error("Failed to load order monitor:", error);
        setLastSync("Sync failed");
      });
  }

  function assignNextOrder() {
    postJson("/dispatch/assign")
      .then(() => loadOrders())
      .catch((error) => {
        console.error("Failed to auto-assign order:", error);
        setLastSync("Assignment failed");
      });
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const visibleRows = useMemo(() => monitoring.orders.filter((row) => {
    if (activeFilter === "Pending") return row.status === "PENDING_DISPATCH";
    if (activeFilter === "Dispatched") return row.status === "DISPATCHED";
    return true;
  }), [activeFilter, monitoring.orders]);

  return (
    <div className="page-stack order-monitoring-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin operations</p>
          <h2>Live Order Monitoring</h2>
          <span>Real-time snapshots from OrderQueue and dispatch state.</span>
        </div>
        <button className="primary-button sync-now-button" type="button" onClick={loadOrders}>
          <span className="material-symbols-outlined">sync</span>
          Sync Now
        </button>
      </section>

      <section className="monitoring-metrics">
        {monitoring.metrics.map((metric) => (
          <article className="monitor-stat-card" key={metric.label}>
            <span className="material-symbols-outlined">{metric.icon}</span>
            <div>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="card live-queue-card">
        <div className="card-header live-queue-header">
          <div>
            <p className="eyebrow">Dispatch queue</p>
            <h3>Live Queue</h3>
          </div>
          <span className="status-chip green">{lastSync}</span>
        </div>

        <div className="queue-toolbar">
          <div className="queue-filter-tabs">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter ? "active" : ""}
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <span>{visibleRows.length} visible live orders</span>
        </div>

        <div className="table-wrap queue-table-wrap">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Order Info</th>
                <th>Pickup & Dropoff</th>
                <th>Status</th>
                <th>Rider Assignment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="order-info-cell">
                      <strong>{order.id}</strong>
                      <small>{new Date(order.time).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="route-cell">
                      <span>{order.pickup}</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                      <span>{order.dropoff}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-chip ${getStatusTone(order.status)}`}>{order.status}</span>
                  </td>
                  <td>
                    <div className={`rider-assignment ${order.rider === "Assign Rider" ? "unassigned" : ""}`}>
                      <span className="mini-rider-avatar">{order.rider === "Assign Rider" ? "?" : order.rider.slice(0, 2)}</span>
                      <div>
                        <strong>{order.rider}</strong>
                        {order.eta && <small>{order.eta} min ETA</small>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="queue-actions">
                      {order.status === "PENDING_DISPATCH" && (
                        <button className="auto-assign-button" type="button" onClick={assignNextOrder}>
                          Auto-Assign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan="5">No orders match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="pagination-footer">
          <span>Showing {visibleRows.length} of {monitoring.orders.length} orders</span>
        </footer>
      </section>
    </div>
  );
}
