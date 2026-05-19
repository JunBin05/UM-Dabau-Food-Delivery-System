import React from "react";
import { activeOrder, restaurants } from "../data/mockData.js";

const foodCategories = [
  { label: "Malay", icon: "rice_bowl" },
  { label: "Chinese", icon: "ramen_dining" },
  { label: "Western", icon: "lunch_dining" },
  { label: "Drinks", icon: "local_cafe" },
  { label: "Snacks", icon: "bakery_dining" },
  { label: "Vegetarian", icon: "eco" }
];

export default function CustomerDashboard({ onNavigate, cartItems = [] }) {
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.qty * item.price, 0);

  return (
    <div className="page-stack customer-app-home">
      <section className="customer-home-hero">
        <div>
          <p className="eyebrow">UM-Dabau Food</p>
          <h2>Hi Aina, what would you like to eat?</h2>
          <button className="location-chip" type="button">
            <span className="material-symbols-outlined">location_on</span>
            Deliver to: Engineering Block C, Room 304
          </button>
        </div>
        <button className="primary-button customer-main-cta" type="button" onClick={() => onNavigate("browse-menu")}>
          Browse Menu
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </section>

      <form className="app-search-bar" onSubmit={(event) => event.preventDefault()}>
        <span className="material-symbols-outlined">search</span>
        <input placeholder="Search nasi lemak, chicken chop, boba..." />
      </form>

      <section className="app-category-row" aria-label="Food categories">
        {foodCategories.map((category) => (
          <button type="button" key={category.label} onClick={() => onNavigate("browse-menu")}>
            <span className="material-symbols-outlined">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </section>

      <section className="customer-promo-card">
        <div>
          <span className="status-chip green">Campus Lunch Deals</span>
          <h3>Save RM 3 on selected meals near FSKTM</h3>
          <p>Frontend mock promo for the lunch rush. No voucher validation is connected.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate("browse-menu")}>Order now</button>
      </section>

      <section className="customer-home-grid">
        <article className="card active-order-mini">
          <div className="card-header">
            <div>
              <p className="eyebrow">Active delivery</p>
              <h3>Arriving in {activeOrder.eta}</h3>
            </div>
            <span className="status-chip blue">{activeOrder.status}</span>
          </div>
          <div className="mini-route-line">
            <span className="material-symbols-outlined">storefront</span>
            <div>
              <strong>{activeOrder.vendor}</strong>
              <small>Rider {activeOrder.rider} is heading to your campus block.</small>
            </div>
          </div>
          <button className="primary-button full" type="button" onClick={() => onNavigate("order-tracking")}>Track Order</button>
        </article>

        <article className="card saved-cart-mini">
          <div className="card-header">
            <h3>Cart</h3>
            <span className="status-chip green">{cartCount} items</span>
          </div>
          <p>{cartCount > 0 ? `RM ${cartTotal.toFixed(2)} waiting in your mock cart.` : "Your cart is empty. Add something tasty from the campus menu."}</p>
          <button className="secondary-button full" type="button" onClick={() => onNavigate("cart")}>View Cart</button>
        </article>
      </section>

      <section className="customer-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Popular near you</p>
            <h3>Campus Restaurants</h3>
          </div>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>View all</button>
        </div>
        <div className="app-restaurant-grid">
          {restaurants.map((restaurant) => (
            <article className="app-vendor-card" key={restaurant.id}>
              <div className="vendor-cover">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <strong>{restaurant.name}</strong>
                <small>{restaurant.cuisine} &middot; {restaurant.campusLocation}</small>
              </div>
              <div className="vendor-card-footer">
                <span className={`status-chip ${restaurant.status === "Open" ? "green" : "amber"}`}>{restaurant.status}</span>
                <b>{restaurant.rating} star</b>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
