import React, { useState } from "react";

const nodeRows = [
  { id: "N-A104", zone: "North Campus", base: "1.0", active: "1.2", status: "Healthy" },
  { id: "N-B221", zone: "Engineering Quad", base: "1.0", active: "4.5", status: "Congested" },
  { id: "N-C099", zone: "Library Hub", base: "1.5", active: "1.5", status: "Healthy" },
  { id: "N-D402", zone: "Dorms West", base: "1.2", active: "2.1", status: "Warning" },
  { id: "N-A105", zone: "North Campus", base: "1.0", active: "1.0", status: "Healthy" }
];

const injectionControls = [
  { label: "Drop Customer", icon: "person_remove", tone: "danger" },
  { label: "Drop Rider", icon: "moped", tone: "danger" },
  { label: "Force Route", icon: "alt_route", tone: "primary" },
  { label: "Reset Graph State", icon: "restart_alt", tone: "neutral" },
  { label: "Trigger Recalculation", icon: "sync", tone: "primary" }
];

export default function DevModeSpoofer() {
  const [demoMode, setDemoMode] = useState(true);
  const [timeAcceleration, setTimeAcceleration] = useState(2.5);
  const [volumeSpike, setVolumeSpike] = useState(150);
  const [weatherFriction, setWeatherFriction] = useState(1.8);
  const [lastAction, setLastAction] = useState("Ready for simulated admin controls");

  const handleInjection = (label) => {
    setLastAction(`${label} queued locally for demo`);
  };

  return (
    <div className="page-stack dev-spoofer-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin demo tools</p>
          <h2>Simulation Spoofer</h2>
          <span>Control backend logic variables and force states for demonstration purposes.</span>
        </div>
        <span className="status-chip danger">DEV ENVIRONMENT ACTIVE</span>
      </section>

      <section className="card master-demo-card">
        <div>
          <p className="eyebrow">Global override</p>
          <h3>Master Demo Mode</h3>
          <span>Enables overriding of live data with spoofed values across all connected client dashboards.</span>
        </div>
        <button
          className={`switch-toggle ${demoMode ? "active" : ""}`}
          type="button"
          aria-pressed={demoMode}
          onClick={() => setDemoMode((current) => !current)}
        >
          <span></span>
          {demoMode ? "Active" : "Inactive"}
        </button>
      </section>

      <section className="dev-grid">
        <article className="card injection-card">
          <div className="card-header">
            <h3>Injection Controls</h3>
            <span className="status-chip amber">Local only</span>
          </div>

          <div className="injection-actions">
            {injectionControls.map((control) => (
              <button
                className={`injection-button ${control.tone}`}
                type="button"
                key={control.label}
                onClick={() => handleInjection(control.label)}
              >
                <span className="material-symbols-outlined">{control.icon}</span>
                {control.label}
              </button>
            ))}
          </div>

          <p className="dev-action-log">{lastAction}</p>
        </article>

        <article className="card node-status-card">
          <div className="card-header">
            <h3>Live Node Status (Graph Weights)</h3>
            <span className="status-chip blue">Polling: 500ms</span>
          </div>

          <div className="table-wrap dev-node-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Node ID</th>
                  <th>Zone</th>
                  <th>Base Weight</th>
                  <th>Active Weight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {nodeRows.map((node) => (
                  <tr key={node.id}>
                    <td><strong>{node.id}</strong></td>
                    <td>{node.zone}</td>
                    <td>{node.base}</td>
                    <td>{node.active}</td>
                    <td>
                      <span className={`node-status-badge ${node.status.toLowerCase()}`}>
                        {node.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="card simulation-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Simulation Parameters</p>
            <h3>Demo Environment Tuning</h3>
          </div>
          <span className="status-chip green">Frontend mock</span>
        </div>

        <div className="simulation-slider-grid">
          <label className="simulation-slider">
            <span>
              <strong>Time Acceleration</strong>
              <b>{timeAcceleration.toFixed(1)}x</b>
            </span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={timeAcceleration}
              onChange={(event) => setTimeAcceleration(Number(event.target.value))}
            />
            <small><span>Realtime</span><span>Fast</span></small>
          </label>

          <label className="simulation-slider">
            <span>
              <strong>Order Volume Spike</strong>
              <b>+{volumeSpike}%</b>
            </span>
            <input
              type="range"
              min="0"
              max="250"
              step="10"
              value={volumeSpike}
              onChange={(event) => setVolumeSpike(Number(event.target.value))}
            />
            <small><span>Normal</span><span>Max Overload</span></small>
          </label>

          <label className="simulation-slider">
            <span>
              <strong>Weather Friction Multiplier</strong>
              <b>{weatherFriction.toFixed(1)}</b>
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={weatherFriction}
              onChange={(event) => setWeatherFriction(Number(event.target.value))}
            />
            <small><span>Clear</span><span>Typhoon</span></small>
          </label>
        </div>
      </section>
    </div>
  );
}
