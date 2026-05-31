import React, { useMemo, useState } from "react";
import { users } from "../data/mockData.js";

const emptyUserForm = {
  id: "",
  name: "",
  email: "",
  role: "Customer",
  status: "Active",
  availability: "Available",
  currentNode: "FSKTM_BLOCK_A"
};

const roleOptions = ["Customer", "Rider", "Admin"];
const statusOptions = ["Active", "Offline", "Suspended"];
const availabilityOptions = ["Available", "Unavailable"];
const nodeOptions = ["FSKTM_BLOCK_A", "KK12", "LIBRARY", "CENTRAL_EATERY"];

export default function UserManagement() {
  const [userRows, setUserRows] = useState(users);
  const [form, setForm] = useState(emptyUserForm);
  const [editingId, setEditingId] = useState("");

  const formTitle = editingId ? `Edit User ${editingId}` : "Add User";
  const riderCount = useMemo(() => userRows.filter((user) => user.role === "Rider").length, [userRows]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "role" && value !== "Rider" ? { availability: "", currentNode: "" } : {})
    }));
  }

  function resetForm() {
    setForm(emptyUserForm);
    setEditingId("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const cleanedUser = {
      ...form,
      id: form.id.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      availability: form.role === "Rider" ? form.availability : "",
      currentNode: form.role === "Rider" ? form.currentNode : "",
      lastSeen: editingId ? "Updated locally" : "Added locally"
    };

    if (!cleanedUser.id || !cleanedUser.name || !cleanedUser.email) {
      return;
    }

    setUserRows((current) => {
      if (editingId) {
        return current.map((user) => (user.id === editingId ? cleanedUser : user));
      }
      return [cleanedUser, ...current.filter((user) => user.id !== cleanedUser.id)];
    });
    resetForm();
  }

  function handleEdit(user) {
    setEditingId(user.id);
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      availability: user.availability || "Available",
      currentNode: user.currentNode || "FSKTM_BLOCK_A"
    });
  }

  function handleDelete(userId) {
    setUserRows((current) => current.filter((user) => user.id !== userId));
    if (editingId === userId) {
      resetForm();
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h2>User Management</h2>
          <span>Temporary frontend mock data for demonstrating add, edit, delete, and display operations.</span>
        </div>
        <span className="status-chip green">{userRows.length} mock users</span>
      </section>

      <section className="management-layout user-management-layout">
        <form className="card management-form" onSubmit={handleSubmit}>
          <div className="card-header">
            <div>
              <p className="eyebrow">Local state only</p>
              <h3>{formTitle}</h3>
            </div>
            {editingId && (
              <button className="text-button" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          <div className="form-grid">
            <label>
              <span>User ID</span>
              <input value={form.id} onChange={(event) => updateField("id", event.target.value)} placeholder="USR-005" required />
            </label>
            <label>
              <span>Full name</span>
              <input value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Nur Iman" required />
            </label>
            <label className="wide">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="name@umdabau.local" required />
            </label>
            <label>
              <span>Role</span>
              <select value={form.role} onChange={(event) => updateField("role", event.target.value)}>
                {roleOptions.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                {statusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            {form.role === "Rider" && (
              <>
                <label>
                  <span>Availability</span>
                  <select value={form.availability} onChange={(event) => updateField("availability", event.target.value)}>
                    {availabilityOptions.map((availability) => <option key={availability}>{availability}</option>)}
                  </select>
                </label>
                <label>
                  <span>Current Node / Location</span>
                  <select value={form.currentNode} onChange={(event) => updateField("currentNode", event.target.value)}>
                    {nodeOptions.map((node) => <option key={node}>{node}</option>)}
                  </select>
                </label>
              </>
            )}
          </div>

          <button className="primary-button full" type="submit">
            <span className="material-symbols-outlined">{editingId ? "save" : "person_add"}</span>
            {editingId ? "Save User" : "Add User"}
          </button>
        </form>

        <section className="card management-panel">
          <div className="card-header management-panel-header">
            <div>
              <p className="eyebrow">Display operation</p>
              <h3>User List</h3>
            </div>
            <span className="status-chip blue">Frontend mock table</span>
          </div>

          <div className="summary-metrics compact">
            <div><strong>{userRows.length}</strong><span>Total users</span></div>
            <div><strong>{riderCount}</strong><span>Riders</span></div>
            <div><strong>{userRows.filter((user) => user.status === "Active").length}</strong><span>Active</span></div>
          </div>

          <div className="table-wrap polished-table-wrap">
            <table>
              <thead>
                <tr><th>User ID</th><th>Full name</th><th>Email</th><th>Role</th><th>Status</th><th>Rider availability</th><th>Current node</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {userRows.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="role-badge">{user.role}</span></td>
                    <td><span className={`status-chip ${user.status === "Suspended" ? "amber" : user.status === "Offline" ? "blue" : "green"}`}>{user.status}</span></td>
                    <td>{user.role === "Rider" ? user.availability : "-"}</td>
                    <td>{user.role === "Rider" ? user.currentNode : "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-button edit" type="button" onClick={() => handleEdit(user)}>
                          <span className="material-symbols-outlined">edit</span>
                          Edit
                        </button>
                        <button className="action-button delete" type="button" onClick={() => handleDelete(user.id)}>
                          <span className="material-symbols-outlined">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
