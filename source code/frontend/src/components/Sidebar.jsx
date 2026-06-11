import React from "react";
import { navigationByRole, roleMeta } from "../config/navigation.js";

function Icon({ name, filled = false }) {
  // Material Symbols uses this font-variation setting for filled active icons.
  return (
    <span className="material-symbols-outlined" style={{ fontVariationSettings: filled ? "'FILL' 1" : undefined }}>
      {name}
    </span>
  );
}

export default function Sidebar({ role, currentPage, onNavigate, onLogout }) {
  const navItems = navigationByRole[role] ?? [];
  const meta = roleMeta[role] ?? roleMeta.customer;
  const brandSubtitle = {
    customer: "Customer Portal",
    rider: "Rider Courier Portal",
    admin: "Food Delivery Admin"
  }[role] ?? "Smart Delivery Portal";

  function handleClick(item) {
    // Logout is the one nav item that changes session state instead of changing page.
    if (item.id === "logout") {
      onLogout();
      return;
    }
    onNavigate(item.id);
  }

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">U</div>
        <div>
          <h1>UM-Dabau</h1>
          <p>{brandSubtitle}</p>
        </div>
      </div>

      <nav className="side-nav" aria-label={`${meta.label} navigation`}>
        {navItems.map((item) => {
          const active = item.id === currentPage;
          return (
            <button
              className={`side-link ${active ? "active" : ""} ${item.danger ? "danger" : ""}`}
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
            >
              <Icon name={item.icon} filled={active} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="role-pill">
          <span>{meta.badge}</span>
          <strong>{meta.label}</strong>
        </div>
      </div>
    </aside>
  );
}
