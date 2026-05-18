import React, { useMemo, useState } from "react";
import { restaurants } from "../data/mockData.js";

const emptyRestaurantForm = {
  id: "",
  name: "",
  category: "Malay Food",
  status: "Open",
  campusLocation: "",
  nodeId: "CENTRAL_EATERY"
};

const categoryOptions = ["Malay Food", "Western", "Drinks", "Cafe", "Fast Food"];
const statusOptions = ["Open", "Closed"];
const nodeOptions = ["CENTRAL_EATERY", "FSKTM_BLOCK_A", "KK12", "LIBRARY", "ENGINEERING_QUAD"];

export default function RestaurantManagement() {
  const [restaurantRows, setRestaurantRows] = useState(restaurants);
  const [form, setForm] = useState(emptyRestaurantForm);
  const [editingId, setEditingId] = useState("");

  const openCount = useMemo(() => restaurantRows.filter((restaurant) => restaurant.status === "Open").length, [restaurantRows]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyRestaurantForm);
    setEditingId("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const existingRestaurant = restaurantRows.find((restaurant) => restaurant.id === editingId);
    const cleanedRestaurant = {
      ...form,
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category,
      cuisine: form.category,
      campusLocation: form.campusLocation.trim(),
      nodeId: form.nodeId,
      orders: editingId ? existingRestaurant?.orders ?? 0 : 0,
      rating: editingId ? existingRestaurant?.rating ?? 4.5 : 4.5
    };

    if (!cleanedRestaurant.id || !cleanedRestaurant.name || !cleanedRestaurant.campusLocation) {
      return;
    }

    setRestaurantRows((current) => {
      if (editingId) {
        return current.map((restaurant) => (restaurant.id === editingId ? cleanedRestaurant : restaurant));
      }
      return [cleanedRestaurant, ...current.filter((restaurant) => restaurant.id !== cleanedRestaurant.id)];
    });
    resetForm();
  }

  function handleEdit(restaurant) {
    setEditingId(restaurant.id);
    setForm({
      id: restaurant.id,
      name: restaurant.name,
      category: restaurant.category || restaurant.cuisine,
      status: restaurant.status === "Closed" ? "Closed" : "Open",
      campusLocation: restaurant.campusLocation || "",
      nodeId: restaurant.nodeId || "CENTRAL_EATERY"
    });
  }

  function handleDelete(restaurantId) {
    setRestaurantRows((current) => current.filter((restaurant) => restaurant.id !== restaurantId));
    if (editingId === restaurantId) {
      resetForm();
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h2>Restaurant Management</h2>
          <span>Temporary frontend mock data for demonstrating restaurant add, edit, delete, and display operations.</span>
        </div>
        <span className="status-chip green">{restaurantRows.length} mock restaurants</span>
      </section>

      <section className="management-layout restaurant-management-layout">
        <form className="card management-form" onSubmit={handleSubmit}>
          <div className="card-header">
            <div>
              <p className="eyebrow">Local state only</p>
              <h3>{editingId ? `Edit Restaurant ${editingId}` : "Add Restaurant"}</h3>
            </div>
            {editingId && (
              <button className="text-button" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          <div className="form-grid">
            <label>
              <span>Restaurant ID</span>
              <input value={form.id} onChange={(event) => updateField("id", event.target.value)} placeholder="REST-005" required />
            </label>
            <label>
              <span>Restaurant name</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="KK12 Quick Bites" required />
            </label>
            <label>
              <span>Category</span>
              <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                {categoryOptions.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span>Open/Closed Status</span>
              <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                {statusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>
              <span>Campus location</span>
              <input value={form.campusLocation} onChange={(event) => updateField("campusLocation", event.target.value)} placeholder="Kolej Kediaman 12" required />
            </label>
            <label>
              <span>Node ID</span>
              <select value={form.nodeId} onChange={(event) => updateField("nodeId", event.target.value)}>
                {nodeOptions.map((node) => <option key={node}>{node}</option>)}
              </select>
            </label>
          </div>

          <button className="primary-button full" type="submit">
            <span className="material-symbols-outlined">{editingId ? "save" : "add_business"}</span>
            {editingId ? "Save Restaurant" : "Add Restaurant"}
          </button>
        </form>

        <section className="card management-panel">
          <div className="card-header management-panel-header">
            <div>
              <p className="eyebrow">Display operation</p>
              <h3>Restaurant List</h3>
            </div>
            <span className="status-chip blue">Frontend mock cards</span>
          </div>

          <div className="summary-metrics compact">
            <div><strong>{restaurantRows.length}</strong><span>Total restaurants</span></div>
            <div><strong>{openCount}</strong><span>Open</span></div>
            <div><strong>{restaurantRows.length - openCount}</strong><span>Closed</span></div>
          </div>

          <div className="restaurant-grid management-card-grid">
            {restaurantRows.map((restaurant) => (
              <article className="restaurant-admin-card polished-restaurant-card" key={restaurant.id}>
                <div className="restaurant-card-top">
                  <div className="vendor-avatar">
                    <span className="material-symbols-outlined">storefront</span>
                  </div>
                  <span className={`status-chip ${restaurant.status === "Closed" ? "amber" : "green"}`}>{restaurant.status}</span>
                </div>
                <div>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.category || restaurant.cuisine} - {restaurant.campusLocation}</p>
                </div>
                <dl className="detail-list">
                  <div><dt>ID</dt><dd>{restaurant.id}</dd></div>
                  <div><dt>Node</dt><dd>{restaurant.nodeId}</dd></div>
                </dl>
                <div className="vendor-meta">
                  <strong>{restaurant.orders} orders</strong>
                  <small>{restaurant.rating} rating</small>
                </div>
                <div className="table-actions">
                  <button className="action-button edit" type="button" onClick={() => handleEdit(restaurant)}>
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                  <button className="action-button delete" type="button" onClick={() => handleDelete(restaurant.id)}>
                    <span className="material-symbols-outlined">delete</span>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
