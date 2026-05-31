import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/liveApi.js";

function categoryMatches(selectedCategory, category) {
  return selectedCategory === "All Items" || selectedCategory === "More Filters" || selectedCategory === category;
}

function restaurantName(restaurant) {
  return restaurant.restaurantName || restaurant.name;
}

export default function BrowseMenu({ initialCategory = "All Items", cartItems = [], onCartAdd = () => {}, onCartRemove = () => {}, onNavigate = () => {}, cartCount = 0 }) {
  const [categories, setCategories] = useState(["All Items"]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [lastAdded, setLastAdded] = useState("");
  const [liveMenuData, setLiveMenuData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchJson("/menu"),
      fetchJson("/live/restaurants")
    ])
      .then(([menu, liveRestaurants]) => {
        setLiveMenuData(menu);
        setRestaurants(liveRestaurants);
        setCategories(["All Items", ...menu.map((item) => item.category).filter(Boolean).filter((category, index, list) => list.indexOf(category) === index), "More Filters"]);
      })
      .catch((error) => console.error("Failed to load browse menu data:", error));

    setSelectedCategory(initialCategory);
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
    Promise.resolve(onCartAdd(item)).then((wasAdded) => {
      if (wasAdded !== false) {
        setLastAdded(item.name);
      }
    });
  }

  function handleRemove(item) {
    onCartRemove(item);
  }

  function getItemQuantity(item) {
    const cartItem = cartItems.find((currentItem) => currentItem.id === (item.itemId || item.id));
    return cartItem?.qty || 0;
  }

  const visibleRestaurants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const restaurantItems = liveMenuData.filter((item) => item.restaurantId === restaurant.restaurantId);
      const categoryList = restaurantItems.map((item) => item.category);
      const matchesCategory = selectedCategory === "All Items" || selectedCategory === "More Filters" || categoryList.includes(selectedCategory);
      const searchable = `${restaurantName(restaurant)} ${restaurant.category} ${restaurant.campusLocation} ${restaurant.nodeId}`.toLowerCase();
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [liveMenuData, restaurants, searchTerm, selectedCategory]);

  const restaurantMenuItems = useMemo(() => {
    if (!selectedRestaurant) return [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return liveMenuData
      .filter((javaItem) => javaItem.restaurantId === selectedRestaurant.restaurantId)
      .map((javaItem) => ({
        itemId: javaItem.itemId,
        restaurantId: javaItem.restaurantId,
        price: javaItem.price,
        id: javaItem.itemId,
        name: javaItem.name,
        category: javaItem.category || "Mains",
        description: `Served by ${restaurantName(selectedRestaurant)}`,
        displayPrice: `RM ${javaItem.price.toFixed(2)}`,
        priceValue: javaItem.price,
        prepTime: "Live",
        tone: "green"
      }))
      .filter((item) => {
        const matchesCategory = categoryMatches(selectedCategory, item.category);
        const searchable = `${item.name} ${item.category} ${item.description}`.toLowerCase();
        return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
      });
  }, [liveMenuData, searchTerm, selectedCategory, selectedRestaurant]);

  const searchPlaceholder = selectedRestaurant
    ? `Search ${restaurantName(selectedRestaurant)} menu...`
    : "Search live restaurants, food, drinks...";

  return (
    <div className="page-stack browse-menu-page">
      <button className="floating-cart-button" type="button" onClick={() => onNavigate("cart")} aria-label="Open cart">
        <span className="material-symbols-outlined">shopping_bag</span>
        {cartCount > 0 && <strong>{cartCount}</strong>}
      </button>

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
        {lastAdded && <small className="menu-add-feedback">{lastAdded} sent to cart.</small>}
      </section>

      <div className="category-strip menu-category-strip">
        {categories.map((category) => (
          <button className={selectedCategory === category ? "active" : ""} type="button" key={category} onClick={() => handleCategoryChange(category)}>
            {category}
          </button>
        ))}
      </div>

      {!selectedRestaurant ? (
        <section className="menu-section">
          <div className="section-heading">
            <div><p className="eyebrow">Restaurants first</p><h3>{selectedCategory === "All Items" || selectedCategory === "More Filters" ? "All campus restaurants" : `${selectedCategory} restaurants`}</h3></div>
            <label className="sort-control"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option>Recommended</option><option>Open Now</option></select></label>
          </div>

          <div className="restaurant-browser-grid">
            {visibleRestaurants.map((restaurant) => (
              <article className="browse-restaurant-card" key={restaurant.restaurantId}>
                <button className="restaurant-card-button" type="button" onClick={() => handleRestaurantClick(restaurant)}>
                  <div className="restaurant-cover food-photo green"><span>{restaurant.nodeId}</span></div>
                  <div className="restaurant-card-body">
                    <div className="menu-card-topline"><span className={restaurant.status === "Open" ? "status-chip green" : "status-chip neutral"}>{restaurant.status}</span><span className="rating-pill">{restaurant.restaurantId}</span></div>
                    <h3>{restaurantName(restaurant)}</h3>
                    <p className="muted">{restaurant.category}</p>
                    <p>{restaurant.campusLocation}</p>
                    <div className="restaurant-meta-row">
                      <span><span className="material-symbols-outlined">restaurant</span>{liveMenuData.filter((item) => item.restaurantId === restaurant.restaurantId).length} live items</span>
                    </div>
                    <span className="icon-label-button full as-link"><span className="material-symbols-outlined">storefront</span>View menu</span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="menu-section">
          <div className="restaurant-detail-header card">
            <div className="restaurant-detail-cover food-photo green"><span>{selectedRestaurant.nodeId}</span></div>
            <div className="restaurant-detail-body">
              <button className="text-button back-button" type="button" onClick={() => setSelectedRestaurant(null)}><span className="material-symbols-outlined">arrow_back</span>Back to restaurants</button>
              <div className="restaurant-detail-title">
                <div><p className="eyebrow">Restaurant menu</p><h3>{restaurantName(selectedRestaurant)}</h3><p>{selectedRestaurant.campusLocation}</p></div>
                <span className={selectedRestaurant.status === "Open" ? "status-chip green" : "status-chip neutral"}>{selectedRestaurant.status}</span>
              </div>
            </div>
          </div>

          <div className="section-heading">
            <div><p className="eyebrow">Menu items</p><h3>{categoryMatches(selectedCategory, "All Items") ? "All items" : `${selectedCategory} items`}</h3></div>
            <span className="status-chip green">{restaurantMenuItems.length} shown</span>
          </div>

          <div className="menu-grid">
            {restaurantMenuItems.map((item) => {
              const itemQuantity = getItemQuantity(item);
              return (
                <article className="menu-card" key={item.id}>
                  <div className={`food-photo ${item.tone}`}><span>{item.category}</span></div>
                  <div className="menu-card-body">
                    <div className="menu-card-topline"><span className="status-chip green">{item.category}</span><span className="rating-pill">{item.prepTime}</span></div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="menu-meta-row"><span><span className="material-symbols-outlined">storefront</span>{restaurantName(selectedRestaurant)}</span><strong>{item.displayPrice}</strong></div>
                    {itemQuantity > 0 ? (
                      <div className="quantity-control" aria-label={`Quantity for ${item.name}`}><button type="button" onClick={() => handleRemove(item)} aria-label={`Remove one ${item.name}`}>-</button><span>{itemQuantity}</span><button type="button" onClick={() => handleAdd(item)} aria-label={`Add one ${item.name}`}>+</button></div>
                    ) : (
                      <button className="icon-label-button full" type="button" onClick={() => handleAdd(item)}><span className="material-symbols-outlined">add_shopping_cart</span>Add</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
