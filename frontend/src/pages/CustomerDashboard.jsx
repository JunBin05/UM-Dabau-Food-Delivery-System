import React from "react";
import { activeOrder, menuItems, restaurants } from "../data/mockData.js";

const foodCategories = [
  { label: "Malay", icon: "rice_bowl", hint: "Rice sets" },
  { label: "Chinese", icon: "ramen_dining", hint: "Wok meals" },
  { label: "Western", icon: "lunch_dining", hint: "Burgers" },
  { label: "Drinks", icon: "local_cafe", hint: "Coffee & tea" },
  { label: "Snacks", icon: "bakery_dining", hint: "Quick bites" },
  { label: "Vegetarian", icon: "eco", hint: "Greens" }
];

const heroFoods = [
  { name: "Nasi Lemak", price: "RM 8.90", tone: "green", icon: "rice_bowl" },
  { name: "Chicken Chop", price: "RM 12.50", tone: "amber", icon: "lunch_dining" },
  { name: "Iced Matcha", price: "RM 5.00", tone: "blue", icon: "local_cafe" }
];

export default function CustomerDashboard({ onNavigate, cartItems = [] }) {
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.qty * item.price, 0);

  return (
    <div className="page-stack customer-app-home">
      <section className="customer-home-hero">
        <div className="customer-hero-copy">
          <p className="eyebrow">UM-Dabau Food Delivery</p>
          <h2>Hi Aina, what would you like to eat?</h2>
          <p className="customer-hero-subtitle">Order campus meals, drinks, and snacks delivered straight to your block.</p>
          <button className="location-chip" type="button">
            <span className="material-symbols-outlined">location_on</span>
            Deliver to: Engineering Block C, Room 304
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

        <div className="hero-food-collage" aria-label="Mock campus food preview">
          <div className="hero-delivery-badge">
            <span className="material-symbols-outlined">delivery_dining</span>
            <strong>12 min ETA</strong>
          </div>
          {heroFoods.map((food) => (
            <article className={`hero-food-card ${food.tone}`} key={food.name}>
              <span className="hero-food-plate">
                <span className="material-symbols-outlined">{food.icon}</span>
              </span>
              <div>
                <strong>{food.name}</strong>
                <small>{food.price}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <form className="app-search-bar" onSubmit={(event) => event.preventDefault()}>
        <span className="material-symbols-outlined">search</span>
        <input placeholder="Search nasi lemak, chicken chop, boba..." />
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
          {foodCategories.map((category) => (
            <button type="button" key={category.label} onClick={() => onNavigate({ page: "browse-menu", category: category.label })}>
              <span className="material-symbols-outlined">{category.icon}</span>
              <strong>{category.label}</strong>
              <small>{category.hint}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="customer-promo-card">
        <div>
          <span className="status-chip green">Campus Lunch Deals</span>
          <h3>Save RM 3 on selected meals near FSKTM</h3>
          <p>Lunch sets, free drink combos, and quick snacks for the next lecture break. Mock promo only.</p>
        </div>
        <div className="promo-food-stack">
          <span>Nasi + Drink</span>
          <strong>RM 10.90</strong>
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
              <small>Rider {activeOrder.rider} is heading to {activeOrder.destination}.</small>
            </div>
          </div>
          <div className="delivery-progress-mini">
            <span></span>
            <span></span>
            <span className="active"></span>
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
              <div className={`vendor-cover ${restaurant.cuisine.toLowerCase().replace(/\s+/g, "-")}`}>
                <span className="material-symbols-outlined">storefront</span>
                <b>{restaurant.cuisine}</b>
              </div>
              <div>
                <strong>{restaurant.name}</strong>
                <small>{restaurant.cuisine} &middot; {restaurant.campusLocation}</small>
                <p>{restaurant.orders > 0 ? `${restaurant.orders} mock orders today` : "Temporarily paused for prep"}</p>
              </div>
              <div className="vendor-card-footer">
                <span className={`status-chip ${restaurant.status === "Open" ? "green" : "amber"}`}>{restaurant.status}</span>
                <b>{restaurant.rating} star</b>
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
            <h3>Popular campus picks</h3>
          </div>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>Browse more</button>
        </div>
        <div className="recommended-meal-row">
          {menuItems.slice(0, 4).map((item) => (
            <article className="recommended-meal-card" key={item.name}>
              <div className={`meal-thumb ${item.tone}`}>
                <span>{item.tag}</span>
              </div>
              <strong>{item.name}</strong>
              <small>{item.vendor}</small>
              <div>
                <b>{item.price}</b>
                <button className="icon-label-button" type="button" onClick={() => onNavigate("browse-menu")}>View</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
