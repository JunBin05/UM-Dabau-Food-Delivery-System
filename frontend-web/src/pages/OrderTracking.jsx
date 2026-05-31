import React from "react";
import { activeOrder } from "../data/mockData.js";

const trackingSteps = [
  { label: "Order Placed", time: "12:10 PM", done: true },
  { label: "Food Prepared", time: "12:24 PM", done: true },
  { label: "Out for Delivery", time: "12:32 PM", done: true, active: true },
  { label: "Delivered pending", time: "Awaiting arrival", done: false }
];

const rider = {
  name: "Marcus T.",
  role: "UM-Dabau Logistics",
  initials: "MT"
};

const orderItems = [
  { id: "TRACK-001", qty: 1, name: "Grilled Chicken Pesto Wrap", total: 8.5 },
  { id: "TRACK-002", qty: 1, name: "Iced Matcha Latte", total: 5 },
  { id: "TRACK-003", qty: 2, name: "Chocolate Chip Cookie", total: 4 }
];

const deliveryFee = 2;
const platformFee = 0.92;

export default function OrderTracking({ onNavigate = () => {} }) {
  const subtotal = orderItems.reduce((total, item) => total + item.total, 0);
  const total = subtotal + deliveryFee + platformFee;

  return (
    <div className="page-stack order-tracking-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Live tracking</p>
          <h2>Live Tracking</h2>
          <span>Order #{activeOrder.id} &middot; {activeOrder.vendor}</span>
        </div>
        <span className="status-chip blue">{activeOrder.status}</span>
      </section>

      <section className="card tracking-map-card">
        <div className="tracking-map-toolbar">
          <div>
            <strong>Campus route preview</strong>
            <span>Restaurant to Engineering Block C</span>
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
          <span className="campus-building building-one"></span>
          <span className="campus-building building-two"></span>
          <span className="campus-building building-three"></span>
          <span className="route-line tracking-route"></span>
          <span className="map-pin vendor"><span>Restaurant</span></span>
          <span className="map-pin rider"><span>Rider</span></span>
          <span className="map-pin dropoff"><span>You</span></span>
          <div className="map-callout tracking-callout">
            <span>Estimated arrival</span>
            <strong>12 mins</strong>
            <small>Distance: 1.2 km</small>
          </div>
        </div>
      </section>

      <section className="tracking-layout">
        <div className="tracking-left-column">
          <article className="card rider-card compact-tracking-card">
            <div className="card-header">
              <h3>Assigned Rider</h3>
              <span className="status-chip green">On route</span>
            </div>
            <div className="rider-profile">
              <div className="rider-avatar">{rider.initials}</div>
              <div>
                <strong>{rider.name}</strong>
                <span>{rider.role}</span>
              </div>
            </div>
            <div className="rider-actions">
              <button className="secondary-button" type="button">
                <span className="material-symbols-outlined">call</span>
                Call
              </button>
              <button className="secondary-button" type="button">
                <span className="material-symbols-outlined">chat</span>
                Message
              </button>
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
            <div>
              <p className="eyebrow">Delivery to</p>
              <h3>Order Summary</h3>
            </div>
            <span className="status-chip green">Mock order</span>
          </div>
          <p className="tracking-destination">
            <span className="material-symbols-outlined">location_on</span>
            {activeOrder.destination}
          </p>

          <div className="tracking-summary-items">
            {orderItems.map((item) => (
              <div className="tracking-summary-row" key={item.id}>
                <span>{item.qty}x</span>
                <strong>{item.name}</strong>
                <dd>RM {item.total.toFixed(2)}</dd>
              </div>
            ))}
          </div>

          <dl className="tracking-costs">
            <div><dt>Subtotal</dt><dd>RM {subtotal.toFixed(2)}</dd></div>
            <div><dt>Delivery fee</dt><dd>RM {deliveryFee.toFixed(2)}</dd></div>
            <div><dt>Tax / platform fee</dt><dd>RM {platformFee.toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {total.toFixed(2)}</dd></div>
          </dl>
        </article>
      </section>
    </div>
  );
}
