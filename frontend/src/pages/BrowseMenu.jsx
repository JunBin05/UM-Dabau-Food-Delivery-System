import React, { useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/liveApi.js";

function categoryMatches(selectedCategory, category) {
  return selectedCategory === "All Items" || selectedCategory === "More Filters" || selectedCategory === category;
}

function restaurantName(restaurant) {
  return restaurant.restaurantName || restaurant.name;
}

const categoryMeta = {
  Malay: { emoji: "🍛", subtitle: "Local rice favourites", tone: "sunset" },
  Chinese: { emoji: "🍜", subtitle: "Noodles and rice", tone: "red" },
  Western: { emoji: "🍗", subtitle: "Chops and fries", tone: "amber" },
  Drinks: { emoji: "🧋", subtitle: "Coffee and coolers", tone: "blue" },
  Snacks: { emoji: "🥐", subtitle: "Quick bites", tone: "orange" },
  Vegetarian: { emoji: "🥗", subtitle: "Fresh and light", tone: "green" },
  Cafe: { emoji: "☕", subtitle: "Toast and brunch", tone: "cafe" },
  Mamak: { emoji: "🫓", subtitle: "Roti and mamak", tone: "mamak" },
  Healthy: { emoji: "🥙", subtitle: "Balanced bowls", tone: "green" }
};

function getCategoryMeta(category = "") {
  return categoryMeta[category] || { emoji: "🍽️", subtitle: "Campus food", tone: "green" };
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
        prepTime: "15-25 min",
        imageUrl: javaItem.imageUrl,
        tone: getCategoryMeta(javaItem.category).tone
      }))
      .filter((item) => {
        const matchesCategory = categoryMatches(selectedCategory, item.category);
        const searchable = `${item.name} ${item.category} ${item.description}`.toLowerCase();
        return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
      });
  }, [liveMenuData, searchTerm, selectedCategory, selectedRestaurant]);

  const searchPlaceholder = selectedRestaurant
    ? `Search ${restaurantName(selectedRestaurant)} menu...`
    : "Search nasi lemak, coffee, chicken rice...";

  return (
    <div className="page-stack browse-menu-page">
      <button className="floating-cart-button" type="button" onClick={() => onNavigate("cart")} aria-label="Open cart">
        <span className="material-symbols-outlined">shopping_bag</span>
        {cartCount > 0 && <strong>{cartCount}</strong>}
      </button>

      <section className="menu-hero card food-delivery-menu-hero">
        <div className="menu-hero-top">
          <div>
            <p className="eyebrow">Campus food delivery</p>
            <h2>What are you craving today?</h2>
            <p>Browse campus restaurants, drinks, snacks, and hot meals for delivery to your block.</p>
          </div>
          <span className="status-chip green">{cartCount} in cart</span>
        </div>
        <div className="menu-hero-food-row" aria-hidden="true">
          <span>🍛 Nasi lemak</span>
          <span>🧋 Iced tea</span>
          <span>🍗 Chicken chop</span>
        </div>
        <form className="hero-search" onSubmit={(event) => event.preventDefault()}>
          <span className="material-symbols-outlined">search</span>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={searchPlaceholder} />
          <button className="primary-button" type="submit">Search</button>
        </form>
        {lastAdded && <small className="menu-add-feedback">{lastAdded} sent to cart.</small>}
      </section>

      <div className="category-strip menu-category-strip">
        {categories.map((category) => {
          const meta = getCategoryMeta(category);
          return (
          <button className={`${selectedCategory === category ? "active" : ""} ${meta.tone}`} type="button" key={category} onClick={() => handleCategoryChange(category)}>
            <span aria-hidden="true">{category === "All Items" ? "🍱" : category === "More Filters" ? "✨" : meta.emoji}</span>
            <strong>{category}</strong>
          </button>
        );})}
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
                  <ImageTile src={restaurant.imageUrl} category={restaurant.category?.split(" ")[0]} label={restaurantName(restaurant)} className="restaurant-cover" />
                  <div className="restaurant-card-body">
                    <div className="menu-card-topline"><span className={restaurant.status === "Open" ? "status-chip green" : "status-chip neutral"}>{restaurant.status}</span><span className="rating-pill">★ 4.{restaurant.restaurantId?.slice(-1) || "8"}</span></div>
                    <h3>{restaurantName(restaurant)}</h3>
                    <p className="muted">{restaurant.category}</p>
                    <p>{restaurant.campusLocation}</p>
                    <div className="restaurant-meta-row">
                      <span><span className="material-symbols-outlined">schedule</span>15-25 min</span>
                      <span><span className="material-symbols-outlined">restaurant</span>{liveMenuData.filter((item) => item.restaurantId === restaurant.restaurantId).length} items</span>
                    </div>
                    <div className="restaurant-tag-row"><span>Free delivery</span><span>Lunch pick</span><span>Near campus</span></div>
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
            <ImageTile src={selectedRestaurant.imageUrl} category={selectedRestaurant.category?.split(" ")[0]} label={restaurantName(selectedRestaurant)} className="restaurant-detail-cover" />
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
                  <ImageTile src={item.imageUrl} category={item.category} label={item.name} className="food-photo" />
                  <div className="menu-card-body">
                    <div className="menu-card-topline"><span className="status-chip green">{item.category}</span><span className="rating-pill">★ 4.8</span></div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="menu-meta-row"><span><span className="material-symbols-outlined">schedule</span>{item.prepTime}</span><strong>{item.displayPrice}</strong></div>
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
