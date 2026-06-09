import React from "react";
import { pageTitles, roleMeta } from "../config/navigation.js";

// Topbar stays present for every logged-in role and reads labels from navigation config.
export default function Topbar({ role, currentPage }) {
  const meta = roleMeta[role] ?? roleMeta.customer;

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="mobile-mark">U</span>
        <span>UM-Dabau Smart Delivery</span>
      </div>

      <div className="topbar-actions">
        <label className="search-control">
          <span className="material-symbols-outlined">search</span>
          <input aria-label="Search" placeholder={meta.search} />
        </label>
        <button className="icon-button" type="button" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="profile-chip" title={pageTitles[currentPage]}>
          <span className="avatar">{meta.profileName.charAt(0)}</span>
          <div>
            <strong>{meta.profileName}</strong>
            <span>{meta.badge}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
