import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/liveApi.js";

export default function OrderTracking({ onNavigate = () => {} }) {
  const [tracking, setTracking] = useState({ order: {}, route: null, items: [], deliveryFee: 0, platformFee: 0 });
  const order = tracking.order || {};
  const route = tracking.route;
  const subtotal = useMemo(() => tracking.items.reduce((total, item) => total + Number(item.price || 0), 0), [tracking.items]);
  const total = subtotal + Number(tracking.deliveryFee || 0) + Number(tracking.platformFee || 0);

  useEffect(() => {
    fetchJson("/live/customer/tracking")
      .then(setTracking)
      .catch((error) => console.error("Failed to load tracking:", error));
  }, []);

  const trackingSteps = [
    { label: "Order Queued", time: order.id || "Pending", done: order.status !== "No Active Delivery" },
    { label: "Rider Assigned", time: order.rider || "Unassigned", done: Boolean(route) },
    { label: "Route Calculated", time: route ? `${Math.ceil(route.estimatedTimeMinutes)} min ETA` : "Awaiting dispatch", done: Boolean(route), active: Boolean(route) },
    { label: "Delivered", time: "Awaiting arrival", done: false }
  ];

  return (
    <div className="page-stack order-tracking-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Live tracking</p>
          <h2>Live Tracking</h2>
          <span>Order {order.id || "pending"} &middot; {order.vendor || "Awaiting dispatch"}</span>
        </div>
        <span className="status-chip blue">{order.status || "No Active Delivery"}</span>
      </section>

      <section className="card tracking-map-card">
        <div className="tracking-map-toolbar">
          <div>
            <strong>Campus route preview</strong>
            <span>{route ? `${route.totalDistanceKm.toFixed(2)} km total route` : "Dispatch route not assigned yet"}</span>
          </div>
          <button className="primary-button" type="button" onClick={() => onNavigate("map-tracker")}>
            View Full Map
            <span className="material-symbols-outlined">open_in_full</span>
          </button>
        </div>
        <div className="mock-map tracking-map">
          <span className="campus-road road-one"></span>
          <span className="campus-road road-two"></span>
          <span className="campus-road road-three"></span>
          <span className="route-line tracking-route"></span>
          <span className="map-pin vendor"><span>Pickup</span></span>
          <span className="map-pin rider"><span>Rider</span></span>
          <span className="map-pin dropoff"><span>You</span></span>
          <div className="map-callout tracking-callout">
            <span>Estimated arrival</span>
            <strong>{order.eta || "0"} mins</strong>
            <small>Distance: {route ? route.totalDistanceKm.toFixed(2) : "0.00"} km</small>
          </div>
        </div>
      </section>

      <section className="tracking-layout">
        <div className="tracking-left-column">
          <article className="card rider-card compact-tracking-card">
            <div className="card-header">
              <h3>Assigned Rider</h3>
              <span className="status-chip green">{route ? "On route" : "Waiting"}</span>
            </div>
            <div className="rider-profile">
              <div className="rider-avatar">{(order.rider || "UA").slice(0, 2)}</div>
              <div>
                <strong>{order.rider || "Unassigned"}</strong>
                <span>UM-Dabau Logistics</span>
              </div>
            </div>
          </article>

          <article className="card delivery-status-card compact-tracking-card">
            <h3>Delivery Status</h3>
            <div className="timeline">
              {trackingSteps.map((step) => (
                <div className={`timeline-step ${step.done ? "done" : ""} ${step.active ? "active" : ""}`} key={step.label}>
                  <span></span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="card tracking-summary-card">
          <div className="card-header">
            <div><p className="eyebrow">Delivery to</p><h3>Order Summary</h3></div>
            <span className="status-chip green">{order.status || "Live"}</span>
          </div>
          <p className="tracking-destination">
            <span className="material-symbols-outlined">location_on</span>
            {order.destination || "No active destination"}
          </p>

          <div className="tracking-summary-items">
            {tracking.items.map((item) => (
              <div className="tracking-summary-row" key={`${item.itemId}-${item.name}`}>
                <span>1x</span>
                <strong>{item.name}</strong>
                <dd>RM {Number(item.price).toFixed(2)}</dd>
              </div>
            ))}
            {tracking.items.length === 0 && <p className="muted">No dispatched order items yet.</p>}
          </div>

          <dl className="tracking-costs">
            <div><dt>Subtotal</dt><dd>RM {subtotal.toFixed(2)}</dd></div>
            <div><dt>Delivery fee</dt><dd>RM {Number(tracking.deliveryFee || 0).toFixed(2)}</dd></div>
            <div><dt>Tax / platform fee</dt><dd>RM {Number(tracking.platformFee || 0).toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {total.toFixed(2)}</dd></div>
          </dl>
        </article>
      </section>
    </div>
  );
}
