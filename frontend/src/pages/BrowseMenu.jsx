import React, { useEffect, useMemo, useState } from "react";
import { categories, restaurantVendors } from "../data/mockData";

function categoryMatches(selectedCategory, category) {
  return selectedCategory === "All Items" || selectedCategory === "More Filters" || selectedCategory === category;
}

function getValidCategory(category) {
  return categories.includes(category) ? category : "All Items";
}

export default function BrowseMenu({ initialCategory = "All Items", onAddToCart = () => {}, cartCount = 0 }) {
  const [selectedCategory, setSelectedCategory] = useState(() => getValidCategory(initialCategory));
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [lastAdded, setLastAdded] = useState("");
  
  // 1. NEW: The state to hold the real Java Data
  const [liveMenuData, setLiveMenuData] = useState([]);

  // 2. NEW: The silent fetch to the backend
  useEffect(() => {
    fetch('http://localhost:8080/api/menu')
      .then(res => res.json())
      .then(data => setLiveMenuData(data))
      .catch(err => console.error("Backend not running yet, falling back to mock data"));

    setSelectedCategory(getValidCategory(initialCategory));
    setSelectedRestaurant(null);
    setSearchTerm("");
    setLastAdded("");
  }, [initialCategory]);

  function handleCategoryChange(category) {
    setSelectedCategory(category);
    setSelectedRestaurant(null);
    setLastAdded("");
    const nextUrl = category && category !== "All Items"
      ? `${window.location.pathname}?category=${encodeURIComponent(category)}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }

  function handleRestaurantClick(restaurant) {
    setSelectedRestaurant(restaurant);
    setSearchTerm("");
    setLastAdded("");
  }

  function handleAdd(item) {
    const itemWithVendor = { ...item, vendor: selectedRestaurant?.name || item.vendor || 'Campus Eatery' };
    onAddToCart(itemWithVendor);
    setLastAdded(item.name);
  }

  const visibleRestaurants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return restaurantVendors.filter((restaurant) => {
      const matchesCategory =
        selectedCategory === "All Items" ||
        selectedCategory === "More Filters" ||
        restaurant.categories.includes(selectedCategory);
      const searchable = `${restaurant.name} ${restaurant.primaryCategory} ${restaurant.categories.join(" ")} ${restaurant.description}`.toLowerCase();
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [searchTerm, selectedCategory]);

  const restaurantMenuItems = useMemo(() => {
    if (!selectedRestaurant) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    
    // 3. NEW: If Java data exists, display it! Otherwise use mock data.
    // (This maps the Java variables perfectly into Vincent's frontend variables)
    const activeData = liveMenuData.length > 0 
      ? liveMenuData.map(javaItem => ({
          id: javaItem.itemId,
          name: javaItem.name,
          category: javaItem.category || "Mains",
          description: "Fresh from the Java Server!",
          price: `RM ${javaItem.price.toFixed(2)}`,
          priceValue: javaItem.price,
          prepTime: "10 min",
          tone: "green"
      }))
      : selectedRestaurant.menuItems;

    return activeData.filter((item) => {
      const matchesCategory = categoryMatches(selectedCategory, item.category);
      const searchable = `${item.name} ${item.category} ${item.description}`.toLowerCase();
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [searchTerm, selectedCategory, selectedRestaurant, liveMenuData]);

  const searchPlaceholder = selectedRestaurant
    ? `Search ${selectedRestaurant.name} menu...`
    : "Search restaurants, Malay food, drinks...";

  return (
    <div className="page-stack browse-menu-page">
      <section className="menu-hero card">
        <div className="menu-hero-top">
          <div>
            <p className="eyebrow">Campus food delivery</p>
            <h2>What are you craving today?</h2>
            <p>Choose a campus restaurant first, then browse the real-time menu.</p>
          </div>
          <span className="status-chip green">{cartCount} in cart</span>
        </div>
        <form className="hero-search" onSubmit={(event) => event.preventDefault()}>
          <span className="material-symbols-outlined">search</span>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={searchPlaceholder} />
          <button className="primary-button" type="submit">Search</button>
        </form>
        {lastAdded && <small className="menu-add-feedback">{lastAdded} added locally to cart.</small>}
      </section>

      <div className="category-strip menu-category-strip">
        {categories.map((category) => (
          <button
            className={selectedCategory === category ? "active" : ""}
            type="button"
            key={category}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {!selectedRestaurant ? (
        <section className="menu-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Restaurants first</p>
              <h3>{selectedCategory === "All Items" || selectedCategory === "More Filters" ? "All campus restaurants" : `${selectedCategory} restaurants`}</h3>
            </div>
            <label className="sort-control">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option>Recommended</option>
                <option>Top Rated</option>
                <option>Fastest Prep</option>
                <option>Open Now</option>
              </select>
            </label>
          </div>

          <div className="restaurant-browser-grid">
            {visibleRestaurants.map((restaurant) => (
              <article className="browse-restaurant-card" key={restaurant.id}>
                <button className="restaurant-card-button" type="button" onClick={() => handleRestaurantClick(restaurant)}>
                  <div className={`restaurant-cover food-photo ${restaurant.tone}`}>
                    <span>{restaurant.promo}</span>
                  </div>
                  <div className="restaurant-card-body">
                    <div className="menu-card-topline">
                      <span className={restaurant.status === "Open" ? "status-chip green" : "status-chip neutral"}>{restaurant.status}</span>
                      <span className="rating-pill">star {restaurant.rating}</span>
                    </div>
                    <h3>{restaurant.name}</h3>
                    <p className="muted">{restaurant.primaryCategory}</p>
                    <p>{restaurant.description}</p>
                    <div className="restaurant-meta-row">
                      <span><span className="material-symbols-outlined">schedule</span>{restaurant.deliveryTime}</span>
                      <span><span className="material-symbols-outlined">restaurant</span>{restaurant.categories.join(", ")}</span>
                    </div>
                    <span className="icon-label-button full as-link">
                      <span className="material-symbols-outlined">storefront</span>
                      View menu
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="menu-section">
          <div className="restaurant-detail-header card">
            <div className={`restaurant-detail-cover food-photo ${selectedRestaurant.tone}`}>
              <span>{selectedRestaurant.promo}</span>
            </div>
            <div className="restaurant-detail-body">
              <button className="text-button back-button" type="button" onClick={() => setSelectedRestaurant(null)}>
                <span className="material-symbols-outlined">arrow_back</span>
                Back to restaurants
              </button>
              <div className="restaurant-detail-title">
                <div>
                  <p className="eyebrow">Restaurant menu</p>
                  <h3>{selectedRestaurant.name}</h3>
                  <p>{selectedRestaurant.description}</p>
                </div>
                <span className={selectedRestaurant.status === "Open" ? "status-chip green" : "status-chip neutral"}>{selectedRestaurant.status}</span>
              </div>
            </div>
          </div>

          <div className="section-heading">
            <div>
              <p className="eyebrow">Menu items</p>
              <h3>{categoryMatches(selectedCategory, "All Items") ? "All items" : `${selectedCategory} items`}</h3>
            </div>
            <span className="status-chip green">{restaurantMenuItems.length} shown</span>
          </div>

          <div className="menu-grid">
            {restaurantMenuItems.map((item) => (
              <article className="menu-card" key={item.id}>
                <div className={`food-photo ${item.tone}`}>
                  <span>{item.category}</span>
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-topline">
                    <span className="status-chip green">{item.category}</span>
                    <span className="rating-pill">{item.prepTime}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className="menu-meta-row">
                    <span><span className="material-symbols-outlined">storefront</span>{selectedRestaurant.name}</span>
                    <strong>{item.price}</strong>
                  </div>
                  <button className="icon-label-button full" type="button" onClick={() => handleAdd(item)}>
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                    Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}