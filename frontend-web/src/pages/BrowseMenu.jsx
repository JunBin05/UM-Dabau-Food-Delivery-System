import React, { useMemo, useState } from "react";

const categories = ["All Items", "Malay", "Chinese", "Western", "Drinks", "Snacks", "Vegetarian", "More Filters"];

const featuredItems = [
  {
    id: "FEATURED-001",
    name: "Nasi Lemak Campus Set",
    category: "Malay",
    vendor: "Campus Cafe",
    rating: "4.9",
    description: "Fragrant coconut rice, sambal, egg, cucumber, peanuts, and crispy anchovies.",
    price: "RM 8.90",
    badge: "Best Seller",
    tone: "green"
  },
  {
    id: "FEATURED-002",
    name: "Hainanese Chicken Chop",
    category: "Western",
    vendor: "Engineering Bites",
    rating: "4.8",
    description: "Golden chicken chop with brown gravy, fries, peas, and campus lunch rush speed.",
    price: "RM 12.50",
    badge: "Top Rated",
    tone: "amber"
  }
];

const menuItems = [
  {
    id: "MENU-001",
    name: "Mee Goreng Mamak",
    category: "Malay",
    vendor: "Faculty Noodles",
    rating: "4.7",
    description: "Spicy wok-fried noodles with tofu, egg, vegetables, and lime.",
    price: "RM 7.50",
    prepTime: "10 min",
    tone: "red"
  },
  {
    id: "MENU-002",
    name: "Sweet Sour Chicken Rice",
    category: "Chinese",
    vendor: "Campus Cafe",
    rating: "4.6",
    description: "Crispy chicken bites tossed in sweet sour sauce with steamed rice.",
    price: "RM 10.90",
    prepTime: "14 min",
    tone: "orange"
  },
  {
    id: "MENU-003",
    name: "Beef Burger Set",
    category: "Western",
    vendor: "Engineering Bites",
    rating: "4.5",
    description: "Juicy beef burger with cheese, lettuce, tomato, and fries.",
    price: "RM 13.90",
    prepTime: "16 min",
    tone: "slate"
  },
  {
    id: "MENU-004",
    name: "Iced Latte",
    category: "Drinks",
    vendor: "Dabau Drinks Lab",
    rating: "4.8",
    description: "Chilled espresso and milk for late lectures and library sessions.",
    price: "RM 6.90",
    prepTime: "5 min",
    tone: "blue"
  },
  {
    id: "MENU-005",
    name: "Curry Puff Duo",
    category: "Snacks",
    vendor: "Central Eatery",
    rating: "4.4",
    description: "Two warm curry puffs packed with potato filling and mild spice.",
    price: "RM 4.50",
    prepTime: "6 min",
    tone: "amber"
  },
  {
    id: "MENU-006",
    name: "Vegetarian Rice Bowl",
    category: "Vegetarian",
    vendor: "Library Greens",
    rating: "4.6",
    description: "Brown rice, tofu, greens, mushrooms, and light sesame dressing.",
    price: "RM 9.80",
    prepTime: "12 min",
    tone: "green"
  }
];

export default function BrowseMenu() {
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === "All Items" || selectedCategory === "More Filters" || item.category === selectedCategory;
      const searchable = `${item.name} ${item.category} ${item.vendor} ${item.description}`.toLowerCase();
      return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="page-stack browse-menu-page">
      <section className="menu-hero card">
        <p className="eyebrow">Campus menu</p>
        <h2>What are you craving today?</h2>
        <p>Browse fresh campus meals, snacks, and drinks from UM-Dabau vendors with frontend mock data only.</p>
        <form className="hero-search" onSubmit={(event) => event.preventDefault()}>
          <span className="material-symbols-outlined">search</span>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search for Nasi Lemak, Chicken Chop, Boba..." />
          <button className="primary-button" type="submit">Search</button>
        </form>
      </section>

      <div className="category-strip menu-category-strip">
        {categories.map((category) => (
          <button
            className={selectedCategory === category ? "active" : ""}
            type="button"
            key={category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <section className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured meals</p>
            <h3>Popular Choices at UM</h3>
          </div>
          <span className="status-chip green">Lunch picks</span>
        </div>
        <div className="featured-menu-grid">
          {featuredItems.map((item) => (
            <article className="featured-food-card" key={item.id}>
              <div className={`food-photo featured ${item.tone}`}>
                <span>{item.badge}</span>
              </div>
              <div className="featured-food-body">
                <div className="menu-card-topline">
                  <span className="status-chip green">{item.badge}</span>
                  <span className="rating-pill">star {item.rating}</span>
                </div>
                <h3>{item.name}</h3>
                <p className="muted">{item.category} &middot; {item.vendor}</p>
                <p>{item.description}</p>
                <div className="menu-card-footer">
                  <strong>{item.price}</strong>
                  <button className="icon-label-button" type="button">
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Campus catalogue</p>
            <h3>All Menu Items</h3>
          </div>
          <label className="sort-control">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option>Recommended</option>
              <option>Top Rated</option>
              <option>Fastest Prep</option>
              <option>Price: Low to High</option>
            </select>
          </label>
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <article className="menu-card" key={item.id}>
              <div className={`food-photo ${item.tone}`}>
                <span>{item.category}</span>
              </div>
              <div className="menu-card-body">
                <div className="menu-card-topline">
                  <span className="status-chip green">{item.category}</span>
                  <span className="rating-pill">star {item.rating}</span>
                </div>
                <h3>{item.name}</h3>
                <p className="muted">{item.vendor}</p>
                <p>{item.description}</p>
                <div className="menu-meta-row">
                  <span><span className="material-symbols-outlined">schedule</span>{item.prepTime}</span>
                  <strong>{item.price}</strong>
                </div>
                <button className="icon-label-button full" type="button">
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  Add
                </button>
              </div>
            </article>
          ))}
        </div>

        <button className="secondary-button load-more-button" type="button">Load More Items</button>
      </section>
    </div>
  );
}
