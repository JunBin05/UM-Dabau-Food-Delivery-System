import React, { useEffect, useMemo, useState } from "react";

const categories = ["All Items", "Malay", "Chinese", "Western", "Drinks", "Snacks", "Vegetarian", "More Filters"];

const restaurantVendors = [
  {
    id: "REST-001",
    name: "Campus Cafe",
    categories: ["Malay", "Chinese", "Drinks"],
    primaryCategory: "Malay & Chinese",
    rating: "4.8",
    deliveryTime: "12-18 min",
    status: "Open",
    description: "Classic campus rice sets, quick noodles, and lecture-break drinks near the main walkway.",
    promo: "RM2 campus lunch deal",
    tone: "green",
    menuItems: [
      {
        id: "MENU-001",
        name: "Nasi Lemak Campus Set",
        category: "Malay",
        description: "Coconut rice with sambal, egg, cucumber, peanuts, and crispy anchovies.",
        price: "RM 8.90",
        priceValue: 8.9,
        prepTime: "10 min",
        tone: "green"
      },
      {
        id: "MENU-002",
        name: "Sweet Sour Chicken Rice",
        category: "Chinese",
        description: "Crispy chicken bites tossed in sweet sour sauce with steamed rice.",
        price: "RM 10.90",
        priceValue: 10.9,
        prepTime: "14 min",
        tone: "orange"
      },
      {
        id: "MENU-003",
        name: "Iced Lemon Tea",
        category: "Drinks",
        description: "Cold campus tea with lemon and light sweetness.",
        price: "RM 3.80",
        priceValue: 3.8,
        prepTime: "4 min",
        tone: "blue"
      }
    ]
  },
  {
    id: "REST-002",
    name: "KK12 Quick Bites",
    categories: ["Malay", "Snacks", "Drinks"],
    primaryCategory: "Malay Snacks",
    rating: "4.6",
    deliveryTime: "8-14 min",
    status: "Open",
    description: "Fast dorm-friendly bites for students around KK12 and nearby study rooms.",
    promo: "Popular near dorms",
    tone: "amber",
    menuItems: [
      {
        id: "MENU-004",
        name: "Mee Goreng Mamak",
        category: "Malay",
        description: "Spicy wok-fried noodles with tofu, egg, vegetables, and lime.",
        price: "RM 7.50",
        priceValue: 7.5,
        prepTime: "10 min",
        tone: "red"
      },
      {
        id: "MENU-005",
        name: "Curry Puff Duo",
        category: "Snacks",
        description: "Two warm curry puffs packed with potato filling and mild spice.",
        price: "RM 4.50",
        priceValue: 4.5,
        prepTime: "6 min",
        tone: "amber"
      },
      {
        id: "MENU-006",
        name: "Sirap Bandung",
        category: "Drinks",
        description: "Iced rose milk drink for a quick sweet refresh.",
        price: "RM 3.50",
        priceValue: 3.5,
        prepTime: "4 min",
        tone: "red"
      }
    ]
  },
  {
    id: "REST-003",
    name: "Central Eatery Malay Corner",
    categories: ["Malay"],
    primaryCategory: "Malay",
    rating: "4.7",
    deliveryTime: "15-22 min",
    status: "Open",
    description: "Hearty Malay plates from Central Eatery with reliable lunch-hour prep.",
    promo: "Best seller",
    tone: "orange",
    menuItems: [
      {
        id: "MENU-007",
        name: "Ayam Masak Merah Rice",
        category: "Malay",
        description: "Tomato-spiced chicken with steamed rice, cucumber, and sambal.",
        price: "RM 9.80",
        priceValue: 9.8,
        prepTime: "13 min",
        tone: "orange"
      },
      {
        id: "MENU-008",
        name: "Rendang Beef Bowl",
        category: "Malay",
        description: "Tender beef rendang served over rice with vegetables.",
        price: "RM 12.90",
        priceValue: 12.9,
        prepTime: "16 min",
        tone: "amber"
      }
    ]
  },
  {
    id: "REST-004",
    name: "Engineering Bites",
    categories: ["Western", "Snacks"],
    primaryCategory: "Western",
    rating: "4.8",
    deliveryTime: "14-20 min",
    status: "Open",
    description: "Chicken chop, burgers, and fries for the Engineering Quad crowd.",
    promo: "Top rated",
    tone: "slate",
    menuItems: [
      {
        id: "MENU-009",
        name: "Hainanese Chicken Chop",
        category: "Western",
        description: "Golden chicken chop with brown gravy, fries, peas, and campus lunch rush speed.",
        price: "RM 12.50",
        priceValue: 12.5,
        prepTime: "15 min",
        tone: "amber"
      },
      {
        id: "MENU-010",
        name: "Beef Burger Set",
        category: "Western",
        description: "Juicy beef burger with cheese, lettuce, tomato, and fries.",
        price: "RM 13.90",
        priceValue: 13.9,
        prepTime: "16 min",
        tone: "slate"
      },
      {
        id: "MENU-011",
        name: "Loaded Fries Cup",
        category: "Snacks",
        description: "Crispy fries with cheese sauce and herbs.",
        price: "RM 6.20",
        priceValue: 6.2,
        prepTime: "8 min",
        tone: "amber"
      }
    ]
  },
  {
    id: "REST-005",
    name: "Dabau Drinks Lab",
    categories: ["Drinks"],
    primaryCategory: "Drinks",
    rating: "4.9",
    deliveryTime: "5-10 min",
    status: "Open",
    description: "Coffee, matcha, and cold drinks for library sessions and late classes.",
    promo: "Fast prep",
    tone: "blue",
    menuItems: [
      {
        id: "MENU-012",
        name: "Iced Matcha Latte",
        category: "Drinks",
        description: "Creamy matcha latte over ice with a smooth finish.",
        price: "RM 5.00",
        priceValue: 5,
        prepTime: "5 min",
        tone: "green"
      },
      {
        id: "MENU-013",
        name: "Iced Latte",
        category: "Drinks",
        description: "Chilled espresso and milk for late lectures and library sessions.",
        price: "RM 6.90",
        priceValue: 6.9,
        prepTime: "5 min",
        tone: "blue"
      }
    ]
  },
  {
    id: "REST-006",
    name: "Library Greens",
    categories: ["Vegetarian", "Drinks"],
    primaryCategory: "Vegetarian",
    rating: "4.5",
    deliveryTime: "12-17 min",
    status: "Closed",
    description: "Vegetarian bowls and lighter meals for students around the library hub.",
    promo: "Reopens 2:00 PM",
    tone: "green",
    menuItems: [
      {
        id: "MENU-014",
        name: "Vegetarian Rice Bowl",
        category: "Vegetarian",
        description: "Brown rice, tofu, greens, mushrooms, and light sesame dressing.",
        price: "RM 9.80",
        priceValue: 9.8,
        prepTime: "12 min",
        tone: "green"
      },
      {
        id: "MENU-015",
        name: "Mushroom Wrap",
        category: "Vegetarian",
        description: "Grilled mushrooms, vegetables, and herb sauce in a warm wrap.",
        price: "RM 8.50",
        priceValue: 8.5,
        prepTime: "11 min",
        tone: "slate"
      }
    ]
  }
];

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

  useEffect(() => {
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
    const itemWithVendor = { ...item, vendor: selectedRestaurant?.name || item.vendor };
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
    if (!selectedRestaurant) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    return selectedRestaurant.menuItems.filter((item) => {
      const matchesCategory = categoryMatches(selectedCategory, item.category);
      const searchable = `${item.name} ${item.category} ${item.description}`.toLowerCase();
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [searchTerm, selectedCategory, selectedRestaurant]);

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
            <p>Choose a campus restaurant first, then browse that vendor's mock menu items.</p>
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

          {visibleRestaurants.length === 0 && (
            <div className="restaurant-menu-empty card">
              <span className="material-symbols-outlined">search_off</span>
              <strong>No restaurants found</strong>
              <p>Try another campus vendor name or category.</p>
            </div>
          )}
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
              <div className="restaurant-detail-actions">
                <span className="rating-pill">star {selectedRestaurant.rating}</span>
                <span><span className="material-symbols-outlined">schedule</span>{selectedRestaurant.deliveryTime}</span>
                <span><span className="material-symbols-outlined">restaurant</span>{selectedRestaurant.primaryCategory}</span>
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

          {restaurantMenuItems.length === 0 && (
            <div className="restaurant-menu-empty card">
              <span className="material-symbols-outlined">restaurant_menu</span>
              <strong>No matching menu items</strong>
              <p>Switch category or search again inside this restaurant.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
