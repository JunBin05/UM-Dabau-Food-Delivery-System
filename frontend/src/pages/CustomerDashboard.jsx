import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/liveApi.js";

const CUSTOMER_ID = "USR-001";

const categoryIcons = {
  Malay: "rice_bowl",
  Chinese: "ramen_dining",
  Western: "lunch_dining",
  Drinks: "local_cafe",
  Snacks: "bakery_dining",
  Vegetarian: "eco",
  Cafe: "bakery_dining",
  Mamak: "breakfast_dining",
  Healthy: "nutrition"
};

const categoryMeta = {
  Malay: { icon: "rice_bowl", emoji: "🍛", subtitle: "Rice, lauk, comfort meals", tone: "sunset" },
  Chinese: { icon: "ramen_dining", emoji: "🍜", subtitle: "Noodles and rice plates", tone: "red" },
  Western: { icon: "lunch_dining", emoji: "🍗", subtitle: "Chops, fries, burgers", tone: "amber" },
  Drinks: { icon: "local_cafe", emoji: "🧋", subtitle: "Coffee, tea, coolers", tone: "blue" },
  Snacks: { icon: "bakery_dining", emoji: "🥐", subtitle: "Quick bites between classes", tone: "orange" },
  Vegetarian: { icon: "eco", emoji: "🥗", subtitle: "Greens and lighter picks", tone: "green" },
  Cafe: { icon: "local_cafe", emoji: "☕", subtitle: "Toast, brunch, coffee", tone: "cafe" },
  Mamak: { icon: "breakfast_dining", emoji: "🫓", subtitle: "Roti and mamak favourites", tone: "mamak" }
};

function restaurantName(restaurant) {
  return restaurant.restaurantName || restaurant.name;
}

function getCategoryMeta(category = "") {
  return categoryMeta[category] || { icon: categoryIcons[category] || "restaurant", emoji: "🍽️", subtitle: "Campus favourites", tone: "green" };
}

function ImageTile({ src, category, label, className = "" }) {
  const meta = getCategoryMeta(category);

  return (
    <div className={`food-image-tile ${meta.tone} ${className}`}>
      {src && <img src={src} alt={label} onError={(event) => { event.currentTarget.hidden = true; }} />}
      <span className="food-fallback-emoji" aria-hidden="true">{meta.emoji}</span>
      <strong>{category || "Campus food"}</strong>
    </div>
  );
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
  const visibleCategories = useMemo(() => {
    const preferredOrder = ["Malay", "Chinese", "Western", "Drinks", "Snacks", "Vegetarian", "Cafe", "Mamak"];
    const availableCategories = home.categories.length > 0 ? home.categories : preferredOrder;
    return preferredOrder.filter((category) => availableCategories.includes(category));
  }, [home.categories]);

  useEffect(() => {
    Promise.all([
      fetchJson("/live/customer/home"),
      fetchJson("/live/users").catch(() => []),
      fetchJson("/live/locations").catch(() => [])
    ])
      .then(([homeData, users, locations]) => {
        const customer = Array.isArray(users) ? users.find((user) => user.userId === CUSTOMER_ID) : null;
        const savedNodeId = customer?.currentNodeId || homeData.deliveryNodeId;
        const savedLocation = Array.isArray(locations) ? locations.find((location) => location.nodeId === savedNodeId) : null;

        setHome({
          ...homeData,
          customerName: customer?.fullName || homeData.customerName,
          deliveryAddress: savedLocation?.name || homeData.deliveryAddress,
          deliveryNodeId: savedNodeId
        });
      })
      .catch((error) => console.error("Failed to load customer home:", error));
  }, []);

  return (
    <div className="page-stack customer-app-home">
      <section className="customer-home-hero">
        <div className="customer-hero-copy">
          <p className="eyebrow">UM-Dabau Food Delivery</p>
          <h2>Hi {home.customerName}, what would you like to eat?</h2>
          <p className="customer-hero-subtitle">Campus meals, drinks, and snacks delivered to your block.</p>
          <button className="location-chip" type="button" onClick={() => onNavigate("cart")} title="Change delivery location">
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
            <article className={`hero-food-card ${getCategoryMeta(food.category).tone}`} key={food.itemId}>
              <ImageTile src={food.imageUrl} category={food.category} label={food.name} className="hero-food-plate" />
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
        <input placeholder="Search nasi lemak, coffee, chicken rice..." />
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
          {visibleCategories.map((category) => {
            const meta = getCategoryMeta(category);
            return (
            <button className={meta.tone} type="button" key={category} onClick={() => onNavigate({ page: "browse-menu", category })}>
              <span className="category-emoji" aria-hidden="true">{meta.emoji}</span>
              <strong>{category}</strong>
              <small>{meta.subtitle}</small>
            </button>
          );})}
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
              <ImageTile src={restaurant.imageUrl} category={restaurant.category?.split(" ")[0]} label={restaurantName(restaurant)} className="vendor-cover" />
              <div>
                <strong>{restaurantName(restaurant)}</strong>
                <small>{restaurant.category} &middot; {restaurant.campusLocation}</small>
                <p>15-25 min &middot; Near campus</p>
              </div>
              <div className="vendor-card-footer">
                <span className={`status-chip ${restaurant.status === "Open" ? "green" : "amber"}`}>{restaurant.status}</span>
                <b>★ 4.{restaurant.restaurantId?.slice(-1) || "8"}</b>
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
            <h3>Campus favourites</h3>
          </div>
          <button className="text-button" type="button" onClick={() => onNavigate("browse-menu")}>Browse more</button>
        </div>
        <div className="recommended-meal-row">
          {home.recommendedItems.slice(0, 4).map((item) => (
            <article className="recommended-meal-card" key={item.itemId}>
              <ImageTile src={item.imageUrl} category={item.category} label={item.name} className="meal-thumb" />
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
