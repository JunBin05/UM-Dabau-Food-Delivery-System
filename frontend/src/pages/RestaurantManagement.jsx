import React, { useEffect, useMemo, useState } from "react";
import { deleteJson, fetchJson, postJson, putJson } from "../api/liveApi.js";

const emptyRestaurantForm = {
  restaurantId: "",
  restaurantName: "",
  category: "Malay Food",
  status: "Open",
  campusLocation: "",
  nodeId: "NODE_UM_CENTRAL"
};

const categoryOptions = ["Cafe", "Malay", "Malay Snacks", "Chinese", "Western", "Mamak", "Middle Eastern", "Healthy", "Drinks", "Vegetarian", "Snacks"];
const statusOptions = ["Open", "Closed"];

export default function RestaurantManagement() {
  const [restaurantRows, setRestaurantRows] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);
  const [form, setForm] = useState(emptyRestaurantForm);
  const [editingId, setEditingId] = useState("");

  const openCount = useMemo(() => restaurantRows.filter((restaurant) => restaurant.status === "Open").length, [restaurantRows]);

  function loadRestaurants() {
    fetchJson("/live/restaurants")
      .then(setRestaurantRows)
      .catch((error) => console.error("Failed to load restaurants:", error));
  }

  useEffect(() => {
    loadRestaurants();
    fetchJson("/live/locations")
      .then(setNodeOptions)
      .catch((error) => console.error("Failed to load graph node options:", error));
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyRestaurantForm);
    setEditingId("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const cleanedRestaurant = {
      ...form,
      restaurantId: form.restaurantId.trim(),
      restaurantName: form.restaurantName.trim(),
      campusLocation: form.campusLocation.trim()
    };

    const request = editingId
      ? putJson(`/live/restaurants/${editingId}`, cleanedRestaurant)
      : postJson("/live/restaurants", cleanedRestaurant);

    request.then(() => {
      loadRestaurants();
      resetForm();
    }).catch((error) => console.error("Failed to save restaurant:", error));
  }

  function handleEdit(restaurant) {
    setEditingId(restaurant.restaurantId);
    setForm({
      restaurantId: restaurant.restaurantId,
      restaurantName: restaurant.restaurantName,
      category: restaurant.category,
      status: restaurant.status,
      campusLocation: restaurant.campusLocation,
      nodeId: restaurant.nodeId
    });
  }

  function handleDelete(restaurantId) {
    deleteJson(`/live/restaurants/${restaurantId}`)
      .then(() => {
        loadRestaurants();
        if (editingId === restaurantId) resetForm();
      })
      .catch((error) => console.error("Failed to delete restaurant:", error));
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h2>Restaurant Management</h2>
          <span>Restaurants are loaded from the backend RestaurantList.</span>
        </div>
        <span className="status-chip green">{restaurantRows.length} restaurants</span>
      </section>

      <section className="management-layout restaurant-management-layout">
        <form className="card management-form" onSubmit={handleSubmit}>
          <div className="card-header">
            <div><p className="eyebrow">Backend write</p><h3>{editingId ? `Edit Restaurant ${editingId}` : "Add Restaurant"}</h3></div>
            {editingId && <button className="text-button" type="button" onClick={resetForm}>Cancel edit</button>}
          </div>

          <div className="form-grid">
            <label><span>Restaurant ID</span><input value={form.restaurantId} onChange={(event) => updateField("restaurantId", event.target.value)} required /></label>
            <label><span>Restaurant name</span><input value={form.restaurantName} onChange={(event) => updateField("restaurantName", event.target.value)} required /></label>
            <label><span>Category</span><select value={form.category} onChange={(event) => updateField("category", event.target.value)}>{categoryOptions.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label><span>Open/Closed Status</span><select value={form.status} onChange={(event) => updateField("status", event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label><span>Campus location</span><input value={form.campusLocation} onChange={(event) => updateField("campusLocation", event.target.value)} required /></label>
            <label><span>Node ID</span><select value={form.nodeId} onChange={(event) => updateField("nodeId", event.target.value)}>{nodeOptions.map((node) => <option value={node.nodeId} key={node.nodeId}>{node.name}</option>)}</select></label>
          </div>

          <button className="primary-button full" type="submit">
            <span className="material-symbols-outlined">{editingId ? "save" : "add_business"}</span>
            {editingId ? "Save Restaurant" : "Add Restaurant"}
          </button>
        </form>

        <section className="card management-panel">
          <div className="card-header management-panel-header">
            <div><p className="eyebrow">Backend read</p><h3>Restaurant List</h3></div>
            <span className="status-chip blue">RestaurantList</span>
          </div>

          <div className="summary-metrics compact">
            <div><strong>{restaurantRows.length}</strong><span>Total restaurants</span></div>
            <div><strong>{openCount}</strong><span>Open</span></div>
            <div><strong>{restaurantRows.length - openCount}</strong><span>Closed</span></div>
          </div>

          <div className="restaurant-grid management-card-grid">
            {restaurantRows.map((restaurant) => (
              <article className="restaurant-admin-card polished-restaurant-card" key={restaurant.restaurantId}>
                <div className="restaurant-card-top">
                  <div className="vendor-avatar"><span className="material-symbols-outlined">storefront</span></div>
                  <span className={`status-chip ${restaurant.status === "Closed" ? "amber" : "green"}`}>{restaurant.status}</span>
                </div>
                <div>
                  <h3>{restaurant.restaurantName}</h3>
                  <p>{restaurant.category} - {restaurant.campusLocation}</p>
                </div>
                <dl className="detail-list">
                  <div><dt>ID</dt><dd>{restaurant.restaurantId}</dd></div>
                  <div><dt>Node</dt><dd>{restaurant.nodeId}</dd></div>
                </dl>
                <div className="table-actions">
                  <button className="action-button edit" type="button" onClick={() => handleEdit(restaurant)}><span className="material-symbols-outlined">edit</span>Edit</button>
                  <button className="action-button delete" type="button" onClick={() => handleDelete(restaurant.restaurantId)}><span className="material-symbols-outlined">delete</span>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
