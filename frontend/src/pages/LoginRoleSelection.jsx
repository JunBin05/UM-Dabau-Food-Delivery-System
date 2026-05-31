import React, { useState } from "react";
import { roles } from "../config/navigation.js";

export default function LoginRoleSelection({ onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState("customer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSelectRole(selectedRole);
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <div className="brand-row">
            <span className="brand-mark food-mark">
              <span className="material-symbols-outlined">restaurant</span>
            </span>
            <div>
              <h1>UM-Dabau</h1>
            </div>
          </div>

          <div className="login-brand-copy">
            <h2>Smart Food Delivery System</h2>
            <p>
              Efficient logistics for our campus community. Streamlining orders from dining halls to dormitories with absolute precision.
            </p>
          </div>
        </div>

        <form className="login-form-panel" onSubmit={handleSubmit}>
          <div className="login-form-heading">
            <h2>Welcome back</h2>
            <span>Please select your role and enter your credentials.</span>
          </div>

          <div className="login-section-label">Select Role</div>
          <div className="login-role-grid">
            {roles.map((role) => (
              <button
                className={`login-role-card ${selectedRole === role.id ? "selected" : ""}`}
                type="button"
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
              >
                <i aria-hidden="true"></i>
                <span className="material-symbols-outlined">{role.icon}</span>
                <strong>{role.label}</strong>
              </button>
            ))}
          </div>

          <label className="login-field">
            <span>User ID / Email</span>
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="vincent.admin@umdabau.local" />
          </label>

          <label className="login-field">
            <span className="password-label-row">
              Password
              <button className="forgot-button" type="button">Forgot?</button>
            </span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter mock password" type="password" />
          </label>

          <button className="primary-button full login-submit" type="submit">
            Sign In to Dashboard
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <div className="login-divider"></div>

          <p className="secure-note">
            <span className="material-symbols-outlined">lock</span>
            Secure portal for authorized personnel
          </p>
        </form>
      </section>
    </main>
  );
}
