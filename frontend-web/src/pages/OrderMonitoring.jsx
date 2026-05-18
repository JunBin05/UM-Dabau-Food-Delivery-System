import React, { useState } from "react";

const metrics = [
  { label: "Active Orders", value: "42", detail: "in queue", icon: "receipt_long" },
  { label: "Pending Assignment", value: "12", detail: "Requires Attention", icon: "assignment_late" },
  { label: "Avg Delivery Time", value: "18", detail: "mins", icon: "schedule" },
  { label: "Available Riders", value: "8", detail: "on standby", icon: "delivery_dining" }
];

const queueRows = [
  {
    id: "#ORD-9821",
    time: "10:42 AM",
    pickup: "Engineering Canteen",
    dropoff: "Library Block B",
    status: "Pending",
    rider: "Assign Rider",
    eta: "",
    action: "Auto-Assign"
  },
  {
    id: "#ORD-9820",
    time: "10:35 AM",
    pickup: "Main Cafe Hub",
    dropoff: "Science Lab 3",
    status: "Dispatched",
    rider: "Ahmad R.",
    eta: "ETA: 4 mins",
    action: "View"
  },
  {
    id: "#ORD-9819",
    time: "10:45 AM",
    pickup: "Student Union Kiosk",
    dropoff: "Dormitory A",
    status: "Pending",
    rider: "Assign Rider",
    eta: "",
    action: "Auto-Assign"
  },
  {
    id: "#ORD-9818",
    time: "10:15 AM",
    pickup: "Engineering Canteen",
    dropoff: "Completed drop-off",
    status: "Delivered",
    rider: "Sarah T.",
    eta: "Delivered",
    action: "View"
  }
];

const filters = ["All", "Pending (12)", "Dispatched (30)"];

function getStatusTone(status) {
  if (status === "Pending") return "amber";
  if (status === "Delivered") return "green";
  return "blue";
}

export default function OrderMonitoring() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lastSync, setLastSync] = useState("Ready to sync mock queue");

  const visibleRows = queueRows.filter((row) => {
    if (activeFilter === "Pending (12)") return row.status === "Pending";
    if (activeFilter === "Dispatched (30)") return row.status === "Dispatched";
    return true;
  });

  return (
    <div className="page-stack order-monitoring-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin operations</p>
          <h2>Live Order Monitoring</h2>
          <span>Real-time tracking of current campus deliveries.</span>
        </div>
        <button className="primary-button sync-now-button" type="button" onClick={() => setLastSync("Mock queue synced locally")}>
          <span className="material-symbols-outlined">sync</span>
          Sync Now
        </button>
      </section>

      <section className="monitoring-metrics">
        {metrics.map((metric) => (
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
          <span>{visibleRows.length} visible mock orders</span>
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
                      <small>{order.time}</small>
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
                      <span className="mini-rider-avatar">{order.rider === "Assign Rider" ? "?" : order.rider.split(" ").map((part) => part[0]).join("")}</span>
                      <div>
                        <strong>{order.rider}</strong>
                        {order.eta && <small>{order.eta}</small>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="queue-actions">
                      <button className="icon-action-button" type="button" title="View order">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {order.status === "Pending" && (
                        <button className="auto-assign-button" type="button">
                          {order.action}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="pagination-footer">
          <span>Showing 1-{visibleRows.length} of 42 orders</span>
          <div>
            <button type="button" disabled>Previous</button>
            <button type="button" className="active">1</button>
            <button type="button">2</button>
            <button type="button">Next</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
