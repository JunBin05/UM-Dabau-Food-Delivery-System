import React, { useEffect, useMemo, useState } from "react";
import { deleteJson, fetchJson, postJson, putJson } from "../api/liveApi.js";

const emptyUserForm = {
  userId: "",
  fullName: "",
  email: "",
  role: "Customer",
  status: "Active",
  available: false,
  currentNodeId: "NODE_FSKTM"
};

const roleOptions = ["Customer", "Rider", "Admin"];
const statusOptions = ["Active", "Offline", "Suspended", "ASSIGNED"];

export default function UserManagement() {
  const [userRows, setUserRows] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);
  const [form, setForm] = useState(emptyUserForm);
  const [editingId, setEditingId] = useState("");

  const formTitle = editingId ? `Edit User ${editingId}` : "Add User";
  const riderCount = useMemo(() => userRows.filter((user) => user.role === "Rider").length, [userRows]);

  function loadUsers() {
    fetchJson("/live/users")
      .then(setUserRows)
      .catch((error) => console.error("Failed to load users:", error));
  }

  useEffect(() => {
    loadUsers();
    fetchJson("/live/locations")
      .then(setNodeOptions)
      .catch((error) => console.error("Failed to load graph node options:", error));
  }, []);

  function updateField(field, value) {
    if (editingId && field === "userId") {
      return;
    }

    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "role" && value !== "Rider" ? { available: false, currentNodeId: "" } : {})
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
      userId: editingId || form.userId.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      available: form.role === "Rider" ? form.available : false,
      currentNodeId: form.role === "Rider" ? form.currentNodeId : ""
    };

    const request = editingId
      ? putJson(`/live/users/${editingId}`, cleanedUser)
      : postJson("/live/users", cleanedUser);

    request.then(() => {
      loadUsers();
      resetForm();
    }).catch((error) => console.error("Failed to save user:", error));
  }

  function handleEdit(user) {
    setEditingId(user.userId);
    setForm({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      available: user.available,
      currentNodeId: user.currentNodeId || "NODE_FSKTM"
    });
  }

  function handleDelete(userId) {
    deleteJson(`/live/users/${userId}`)
      .then(() => {
        loadUsers();
        if (editingId === userId) resetForm();
      })
      .catch((error) => console.error("Failed to delete user:", error));
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin controls</p>
          <h2>User Management</h2>
          <span>Users are loaded from the backend UserList.</span>
        </div>
        <span className="status-chip green">{userRows.length} users</span>
      </section>

      <section className="management-layout user-management-layout">
        <form className="card management-form" onSubmit={handleSubmit}>
          <div className="card-header">
            <div>
              <p className="eyebrow">Backend write</p>
              <h3>{formTitle}</h3>
            </div>
            {editingId && <button className="text-button" type="button" onClick={resetForm}>Cancel edit</button>}
          </div>

          <div className="form-grid">
            <label>
              <span>User ID</span>
              <input value={form.userId} onChange={(event) => updateField("userId", event.target.value)} readOnly={Boolean(editingId)} required />
              {editingId && <small>User ID cannot be changed after creation.</small>}
            </label>
            <label><span>Full name</span><input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} required /></label>
            <label className="wide"><span>Email</span><input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required /></label>
            <label><span>Role</span><select value={form.role} onChange={(event) => updateField("role", event.target.value)}>{roleOptions.map((role) => <option key={role}>{role}</option>)}</select></label>
            <label><span>Status</span><select value={form.status} onChange={(event) => updateField("status", event.target.value)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
            {form.role === "Rider" && (
              <>
                <label><span>Availability</span><select value={String(form.available)} onChange={(event) => updateField("available", event.target.value === "true")}><option value="true">Available</option><option value="false">Unavailable</option></select></label>
                <label><span>Current Node</span><select value={form.currentNodeId} onChange={(event) => updateField("currentNodeId", event.target.value)}>{nodeOptions.map((node) => <option value={node.nodeId} key={node.nodeId}>{node.name}</option>)}</select></label>
              </>
            )}
          </div>

          <button className="primary-button full" type="submit">
            <span className="material-symbols-outlined">{editingId ? "save" : "person_add"}</span>
            {editingId ? "Save Changes" : "Add User"}
          </button>
        </form>

        <section className="card management-panel">
          <div className="card-header management-panel-header">
            <div><p className="eyebrow">Backend read</p><h3>User List</h3></div>
            <span className="status-chip blue">UserList</span>
          </div>

          <div className="summary-metrics compact">
            <div><strong>{userRows.length}</strong><span>Total users</span></div>
            <div><strong>{riderCount}</strong><span>Riders</span></div>
            <div><strong>{userRows.filter((user) => user.status === "Active").length}</strong><span>Active</span></div>
          </div>

          <div className="table-wrap polished-table-wrap">
            <table>
              <thead><tr><th>User ID</th><th>Full name</th><th>Email</th><th>Role</th><th>Status</th><th>Available</th><th>Current node</th><th>Actions</th></tr></thead>
              <tbody>
                {userRows.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.userId}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td><span className="role-badge">{user.role}</span></td>
                    <td><span className={`status-chip ${user.status === "Suspended" ? "amber" : user.status === "Offline" ? "blue" : "green"}`}>{user.status}</span></td>
                    <td>{user.role === "Rider" ? (user.available ? "Available" : "Unavailable") : "-"}</td>
                    <td>{user.role === "Rider" ? user.currentNodeId : "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-button edit" type="button" onClick={() => handleEdit(user)}><span className="material-symbols-outlined">edit</span>Edit</button>
                        <button className="action-button delete" type="button" onClick={() => handleDelete(user.userId)}><span className="material-symbols-outlined">delete</span>Delete</button>
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
