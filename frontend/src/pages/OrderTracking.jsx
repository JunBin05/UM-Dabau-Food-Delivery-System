import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchJson, postJson } from "../api/liveApi.js";

const markerIcons = {
  driver: L.divIcon({
    className: "delivery-map-marker driver-marker",
    html: '<span class="material-symbols-outlined">two_wheeler</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  cafe: L.divIcon({
    className: "delivery-map-marker cafe-marker",
    html: '<span class="material-symbols-outlined">restaurant</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  }),
  user: L.divIcon({
    className: "delivery-map-marker user-marker",
    html: '<span class="material-symbols-outlined">person_pin_circle</span>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -20]
  })
};
const DRIVER_STEP_MS = 1400;

function trackingStorageKey(orderId) {
  return `um-dabau-tracking-start-${orderId}`;
}

function getStoredStartTime(orderId, fallbackStartTime) {
  if (!orderId) {
    return Date.now();
  }

  const key = trackingStorageKey(orderId);
  const storedStartTime = Number(window.localStorage.getItem(key));
  if (Number.isFinite(storedStartTime) && storedStartTime > 0) {
    return storedStartTime;
  }

  const startTime = Number.isFinite(Number(fallbackStartTime)) && Number(fallbackStartTime) > 0
    ? Number(fallbackStartTime)
    : Date.now();
  window.localStorage.setItem(key, String(startTime));
  return startTime;
}

function findNodeIndex(path, nodeId, fallbackIndex) {
  const index = path.findIndex((node) => node.nodeId === nodeId);
  return index >= 0 ? index : fallbackIndex;
}

function getPhase(driverIndex, pickupIndex, finalIndex) {
  if (finalIndex <= 0) {
    return {
      headline: "No order right now",
      status: "No Active Order",
      description: "Place an order to start live delivery tracking.",
      activeStep: 0
    };
  }

  if (driverIndex < pickupIndex) {
    return {
      headline: "Driver is moving to your cafe",
      status: "To Pickup",
      description: "Your rider is heading to the restaurant to collect your order.",
      activeStep: 1
    };
  }

  if (driverIndex === pickupIndex) {
    return {
      headline: "Driver has picked up your order",
      status: "Picked Up",
      description: "Your food has left the cafe and is heading to you.",
      activeStep: 2
    };
  }

  if (driverIndex < finalIndex) {
    return {
      headline: "Driver is heading to you",
      status: "On Route",
      description: "Your rider is moving from the cafe to your delivery point.",
      activeStep: 3
    };
  }

  return {
    headline: "Driver has arrived",
    status: "Arrived",
    description: "Your rider has reached the drop-off point.",
    activeStep: 4
  };
}

export default function OrderTracking({ onNavigate = () => {} }) {
  const [tracking, setTracking] = useState({ order: {}, route: null, items: [], deliveryFee: 0, platformFee: 0, pickupNodeId: "", dropoffNodeId: "" });
  const [routeStartTime, setRouteStartTime] = useState(0);
  const [simulationNow, setSimulationNow] = useState(Date.now());
  const [completionMessage, setCompletionMessage] = useState("");
  const order = tracking.order || {};
  const route = tracking.route;
  const path = route?.path || [];
  const finalIndex = Math.max(path.length - 1, 0);
  const driverIndex = routeStartTime > 0
    ? Math.min(Math.max(Math.floor((simulationNow - routeStartTime) / DRIVER_STEP_MS), 0), finalIndex)
    : 0;
  const pickupIndex = findNodeIndex(path, tracking.pickupNodeId, Math.floor(finalIndex / 2));
  const driverNode = path[driverIndex];
  const pickupNode = path[pickupIndex];
  const dropoffNode = path[finalIndex];
  const phase = getPhase(driverIndex, pickupIndex, finalIndex);
  const routePositions = useMemo(() => path.map((node) => [node.latitude, node.longitude]), [path]);
  const subtotal = useMemo(() => tracking.items.reduce((total, item) => total + Number(item.price || 0), 0), [tracking.items]);
  const total = subtotal + Number(tracking.deliveryFee || 0) + Number(tracking.platformFee || 0);

  function loadTracking() {
    return fetchJson("/live/customer/tracking")
      .then((data) => {
        setTracking(data);
        const orderId = data.order?.id || data.route?.orderId;
        setRouteStartTime(data.route ? getStoredStartTime(orderId, data.order?.timestamp) : 0);
        setSimulationNow(Date.now());
      })
      .catch((error) => console.error("Failed to load tracking:", error));
  }

  function markOrderReceived() {
    postJson("/orders/received")
      .then((result) => {
        if (route?.orderId) {
          window.localStorage.removeItem(trackingStorageKey(route.orderId));
        }
        setCompletionMessage(result.message);
        return loadTracking();
      })
      .catch((error) => {
        console.error("Failed to complete delivery:", error);
        setCompletionMessage("Could not complete delivery. Please try again.");
      });
  }

  useEffect(() => {
    loadTracking();
  }, []);

  useEffect(() => {
    if (path.length <= 1 || driverIndex >= finalIndex) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSimulationNow(Date.now());
    }, DRIVER_STEP_MS);

    return () => window.clearInterval(timer);
  }, [driverIndex, finalIndex, path.length]);

  const trackingSteps = [
    { label: "Driver found", time: order.rider || "Assigned", done: Boolean(route), active: phase.activeStep === 0 },
    { label: "Moving to cafe", time: pickupNode?.name || "Pickup", done: phase.activeStep > 1, active: phase.activeStep === 1 },
    { label: "Order picked up", time: pickupNode?.name || "Cafe", done: phase.activeStep > 2, active: phase.activeStep === 2 },
    { label: "Heading to you", time: dropoffNode?.name || "Drop-off", done: phase.activeStep > 3, active: phase.activeStep === 3 },
    { label: "Arrived", time: phase.activeStep === 4 ? "Reached drop-off" : "Awaiting arrival", done: phase.activeStep === 4, active: phase.activeStep === 4 }
  ];

  return (
    <div className="page-stack order-tracking-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Live tracking</p>
          <h2>{phase.headline}</h2>
          <span>{phase.description}</span>
        </div>
        <span className="status-chip blue">{phase.status}</span>
      </section>

      <section className="card tracking-map-card">
        <div className="tracking-map-toolbar">
          <div>
            <strong>Order {order.id || "pending"}</strong>
            <span>{route ? `${route.totalDistanceKm.toFixed(2)} km route - ${Math.ceil(route.estimatedTimeMinutes)} min ETA` : "No order right now"}</span>
          </div>
          <button className="primary-button" type="button" onClick={() => onNavigate("map-tracker")}>
            View Full Map
            <span className="material-symbols-outlined">open_in_full</span>
          </button>
        </div>

        <div className="tracking-map" style={{ height: 360, overflow: "hidden", borderRadius: 16 }}>
          <MapContainer center={driverNode ? [driverNode.latitude, driverNode.longitude] : [3.1209, 101.6521]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            {routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ color: "#16a34a", weight: 6, opacity: 0.78 }} />}
            {pickupNode && (
              <Marker icon={markerIcons.cafe} position={[pickupNode.latitude, pickupNode.longitude]}>
                <Popup><strong>Cafe pickup</strong><br />{pickupNode.name}</Popup>
              </Marker>
            )}
            {dropoffNode && (
              <Marker icon={markerIcons.user} position={[dropoffNode.latitude, dropoffNode.longitude]}>
                <Popup><strong>Your location</strong><br />{dropoffNode.name}</Popup>
              </Marker>
            )}
            {driverNode && (
              <Marker icon={markerIcons.driver} position={[driverNode.latitude, driverNode.longitude]}>
                <Popup><strong>Driver</strong><br />{order.rider || route?.assignedRiderId}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </section>

      <section className="tracking-layout">
        <div className="tracking-left-column">
          <article className="card rider-card compact-tracking-card">
            <div className="card-header">
              <h3>Assigned Rider</h3>
              <span className="status-chip green">{order.rider || route?.assignedRiderId || "Assigned"}</span>
            </div>
            <div className="rider-profile">
              <div className="rider-avatar">{(order.rider || route?.assignedRiderId || "DR").slice(0, 2)}</div>
              <div>
                <strong>{order.rider || route?.assignedRiderId || "Driver"}</strong>
                <span>{driverNode?.name || "Moving through UM campus"}</span>
              </div>
            </div>
          </article>

          <article className="card delivery-status-card compact-tracking-card">
            <h3>Delivery Status</h3>
            <div className="timeline">
              {trackingSteps.map((step) => (
                <div className={`timeline-step ${step.done ? "done" : ""} ${step.active ? "active" : ""}`} key={step.label}>
                  <span></span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="card tracking-summary-card">
          <div className="card-header">
            <div><p className="eyebrow">Delivery to</p><h3>Order Summary</h3></div>
            <span className="status-chip green">{order.status || "Live"}</span>
          </div>
          <p className="tracking-destination">
            <span className="material-symbols-outlined">location_on</span>
            {dropoffNode?.name || order.destination || "No active destination"}
          </p>

          <div className="tracking-summary-items">
            {tracking.items.map((item) => (
              <div className="tracking-summary-row" key={`${item.itemId}-${item.name}`}>
                <span>1x</span>
                <strong>{item.name}</strong>
                <dd>RM {Number(item.price).toFixed(2)}</dd>
              </div>
            ))}
            {tracking.items.length === 0 && <p className="muted">No dispatched order items yet.</p>}
          </div>

          <dl className="tracking-costs">
            <div><dt>Subtotal</dt><dd>RM {subtotal.toFixed(2)}</dd></div>
            <div><dt>Delivery fee</dt><dd>RM {Number(tracking.deliveryFee || 0).toFixed(2)}</dd></div>
            <div><dt>Tax / platform fee</dt><dd>RM {Number(tracking.platformFee || 0).toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {total.toFixed(2)}</dd></div>
          </dl>
          {phase.activeStep === 4 && route && (
            <button className="primary-button full" type="button" onClick={markOrderReceived}>
              <span className="material-symbols-outlined">task_alt</span>
              Order Received
            </button>
          )}
          {completionMessage && <p className="muted">{completionMessage}</p>}
        </article>
      </section>
    </div>
  );
}
