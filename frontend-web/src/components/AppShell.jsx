import React from "react";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ role, currentPage, onNavigate, onLogout, children }) {
  return (
    <div className="app-shell">
      <Sidebar role={role} currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="main-frame">
        <Topbar role={role} currentPage={currentPage} />
        <main className="page-frame">{children}</main>
      </div>
    </div>
  );
}
