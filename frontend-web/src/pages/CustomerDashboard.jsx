import React from "react";
import { activeOrder, customerStats, restaurants } from "../data/mockData.js";

export default function CustomerDashboard({ onNavigate }) {
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Customer overview</p>
          <h2>Welcome back, Aina</h2>
          <span>Here is what is happening with your campus food delivery.</span>
        </div>
        <button className="primary-button" type="button" onClick={() => onNavigate("browse-menu")}>
          <span className="material-symbols-outlined">restaurant</span>
          Browse Menu
        </button>
      </section>

      <section className="stat-grid three">
        {customerStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-icon material-symbols-outlined">{stat.icon}</span>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.change}</small>
          </article>
        ))}
      </section>

      <section className="content-grid two-one">
        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Current delivery</p>
              <h3>Order #{activeOrder.id}</h3>
            </div>
            <span className="status-chip blue">{activeOrder.status}</span>
          </div>
          <div className="delivery-card">
            <div className="mock-map small">
              <span className="route-line"></span>
              <span className="map-pin vendor"></span>
              <span className="map-pin rider"></span>
              <span className="map-pin dropoff"></span>
            </div>
            <div className="delivery-details">
              <strong>{activeOrder.vendor}</strong>
              <span>Rider: {activeOrder.rider}</span>
              <span>Destination: {activeOrder.destination}</span>
              <span>ETA: {activeOrder.eta}</span>
              <button className="secondary-button" type="button" onClick={() => onNavigate("order-tracking")}>
                Track Order
              </button>
            </div>
          </div>
        </article>

        <article className="card">
          <div className="card-header">
            <h3>Saved cart</h3>
            <span className="status-chip green">3 items</span>
          </div>
          <p className="muted">Nasi Lemak Campus Set and Iced Latte are waiting in your cart preview.</p>
          <button className="secondary-button full" type="button" onClick={() => onNavigate("cart")}>
            View Cart
          </button>
        </article>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Campus vendors</h3>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>View all</button>
        </div>
        <div className="restaurant-row">
          {restaurants.slice(0, 3).map((restaurant) => (
            <div className="restaurant-tile" key={restaurant.name}>
              <span className="material-symbols-outlined">storefront</span>
              <strong>{restaurant.name}</strong>
              <small>{restaurant.cuisine}</small>
              <span className={`status-chip ${restaurant.status === "Open" ? "green" : "amber"}`}>{restaurant.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
