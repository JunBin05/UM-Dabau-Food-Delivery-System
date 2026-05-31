import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/liveApi.js";

const categoryIcons = {
  Malay: "rice_bowl",
  Chinese: "ramen_dining",
  Western: "lunch_dining",
  Drinks: "local_cafe",
  Snacks: "bakery_dining",
  Vegetarian: "eco"
};

function restaurantName(restaurant) {
  return restaurant.restaurantName || restaurant.name;
}

export default function CustomerDashboard({ onNavigate, cartItems = [] }) {
  const [home, setHome] = useState({
    customerName: "Customer",
    deliveryAddress: "Select delivery point",
    restaurants: [],
    recommendedItems: [],
    categories: [],
    activeOrder: null
  });
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.qty * item.price, 0);
  const activeOrder = home.activeOrder || {};
  const heroItems = useMemo(() => home.recommendedItems.slice(0, 3), [home.recommendedItems]);

  useEffect(() => {
    fetchJson("/live/customer/home")
      .then(setHome)
      .catch((error) => console.error("Failed to load customer home:", error));
  }, []);

  return (
    <div className="page-stack customer-app-home">
      <section className="customer-home-hero">
        <div className="customer-hero-copy">
          <p className="eyebrow">UM-Dabau Food Delivery</p>
          <h2>Hi {home.customerName}, what would you like to eat?</h2>
          <p className="customer-hero-subtitle">Order campus meals, drinks, and snacks delivered straight to your block.</p>
          <button className="location-chip" type="button">
            <span className="material-symbols-outlined">location_on</span>
            Deliver to: {home.deliveryAddress}
          </button>
          <div className="customer-hero-actions">
            <button className="primary-button customer-main-cta" type="button" onClick={() => onNavigate("browse-menu")}>
              Browse Menu
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="secondary-button customer-hero-secondary" type="button" onClick={() => onNavigate("order-tracking")}>
              Track Delivery
            </button>
          </div>
        </div>

        <div className="hero-food-collage" aria-label="Live campus food preview">
          <div className="hero-delivery-badge">
            <span className="material-symbols-outlined">delivery_dining</span>
            <strong>{activeOrder.eta || "0"} min ETA</strong>
          </div>
          {heroItems.map((food) => (
            <article className="hero-food-card green" key={food.itemId}>
              <span className="hero-food-plate">
                <span className="material-symbols-outlined">{categoryIcons[food.category] || "restaurant"}</span>
              </span>
              <div>
                <strong>{food.name}</strong>
                <small>RM {Number(food.price).toFixed(2)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <form className="app-search-bar" onSubmit={(event) => event.preventDefault()}>
        <span className="material-symbols-outlined">search</span>
        <input placeholder="Search from the live Java menu..." />
      </form>

      <section className="customer-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Browse by cuisine</p>
            <h3>What are you in the mood for?</h3>
          </div>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>All restaurants</button>
        </div>
        <div className="app-category-row" aria-label="Food categories">
          {home.categories.map((category) => (
            <button type="button" key={category} onClick={() => onNavigate({ page: "browse-menu", category })}>
              <span className="material-symbols-outlined">{categoryIcons[category] || "restaurant"}</span>
              <strong>{category}</strong>
              <small>From live menu</small>
            </button>
          ))}
        </div>
      </section>

      <section className="customer-home-grid">
        <article className="card active-order-mini">
          <div className="card-header">
            <div>
              <p className="eyebrow">Active delivery</p>
              <h3>{activeOrder.status || "No Active Delivery"}</h3>
            </div>
            <span className="status-chip blue">{activeOrder.eta || "0"} min</span>
          </div>
          <div className="mini-route-line">
            <span className="material-symbols-outlined">storefront</span>
            <div>
              <strong>{activeOrder.vendor || "Awaiting dispatch"}</strong>
              <small>Rider {activeOrder.rider || "Unassigned"} heading to {activeOrder.destination || home.deliveryAddress}.</small>
            </div>
          </div>
          <button className="primary-button full" type="button" onClick={() => onNavigate("order-tracking")}>Track Order</button>
        </article>

        <article className="card saved-cart-mini">
          <div className="card-header">
            <h3>Cart</h3>
            <span className="status-chip green">{cartCount} items</span>
          </div>
          <p>{cartCount > 0 ? `RM ${cartTotal.toFixed(2)} waiting in your live cart.` : "Your cart is empty. Add something tasty from the campus menu."}</p>
          <button className="secondary-button full" type="button" onClick={() => onNavigate("cart")}>View Cart</button>
        </article>
      </section>

      <section className="customer-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Open near you</p>
            <h3>Campus Restaurants</h3>
          </div>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>View all</button>
        </div>
        <div className="app-restaurant-grid">
          {home.restaurants.map((restaurant) => (
            <article className="app-vendor-card" key={restaurant.restaurantId}>
              <div className="vendor-cover">
                <span className="material-symbols-outlined">storefront</span>
                <b>{restaurant.category}</b>
              </div>
              <div>
                <strong>{restaurantName(restaurant)}</strong>
                <small>{restaurant.category} &middot; {restaurant.campusLocation}</small>
                <p>Node {restaurant.nodeId}</p>
              </div>
              <div className="vendor-card-footer">
                <span className={`status-chip ${restaurant.status === "Open" ? "green" : "amber"}`}>{restaurant.status}</span>
              </div>
              <button className="secondary-button full" type="button" onClick={() => onNavigate("browse-menu")}>View menu</button>
            </article>
          ))}
        </div>
      </section>

      <section className="customer-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recommended dishes</p>
            <h3>Live Java menu picks</h3>
          </div>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>Browse more</button>
        </div>
        <div className="recommended-meal-row">
          {home.recommendedItems.slice(0, 4).map((item) => (
            <article className="recommended-meal-card" key={item.itemId}>
              <div className="meal-thumb green">
                <span>{item.category}</span>
              </div>
              <strong>{item.name}</strong>
              <small>{item.restaurantId}</small>
              <div>
                <b>RM {Number(item.price).toFixed(2)}</b>
                <button className="icon-label-button" type="button" onClick={() => onNavigate("browse-menu")}>View</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
