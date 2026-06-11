import React, { useEffect, useState } from "react";
import { fetchJson, postJson } from "../api/liveApi.js";
import DeliveryMapView, { DRIVER_STEP_MS } from "../components/DeliveryMapView.jsx";

function trackingStorageKey(orderId) {
  return `um-dabau-tracking-start-${orderId}`;
}

function getStoredStartTime(orderId, fallbackStartTime) {
  // Keep the simulated rider movement steady across refreshes for the same order.
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

function getPhase(hasActiveOrder, hasRoute, driverIndex, pickupIndex, finalIndex) {
  // UI wording is based on where the rider is along the route path.
  if (!hasActiveOrder) {
    return {
      headline: "No order right now",
      status: "No Active Order",
      description: "Place an order to start live delivery tracking.",
      activeStep: 0
    };
  }

  if (!hasRoute) {
    return {
      headline: "Waiting for rider assignment",
      status: "Pending Dispatch",
      description: "Your order has been placed and is waiting for an available rider.",
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
  const emptyTracking = { hasActiveOrder: false, order: {}, route: null, items: [], deliveryFee: 0, platformFee: 0, pickupNodeId: "", dropoffNodeId: "" };
  const [tracking, setTracking] = useState({ hasActiveOrder: false, order: {}, route: null, items: [], deliveryFee: 0, platformFee: 0, pickupNodeId: "", dropoffNodeId: "" });
  const [locations, setLocations] = useState([]);
  const [riderLocations, setRiderLocations] = useState([]);
  const [routeStartTime, setRouteStartTime] = useState(0);
  const [simulationNow, setSimulationNow] = useState(Date.now());
  const [completionMessage, setCompletionMessage] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const order = tracking.order || {};
  const route = tracking.route;
  const path = route?.path || [];
  const trackingItems = tracking.items || tracking.orderItems || [];
  // Accept a few backend field names so older and newer tracking responses both render.
  const hasActiveOrder = Boolean(
    tracking.hasActiveOrder
    || tracking.active
    || tracking.orderId
    || order.id
    || route?.orderId
  );
  const hasRoute = hasActiveOrder && path.length > 1;
  const finalIndex = Math.max(path.length - 1, 0);
  // Move one graph-node step at a time; DeliveryMapView uses the same index for the rider marker.
  const driverIndex = routeStartTime > 0
    ? Math.min(Math.max(Math.floor((simulationNow - routeStartTime) / DRIVER_STEP_MS), 0), finalIndex)
    : 0;
  const pickupIndex = findNodeIndex(path, tracking.pickupNodeId, Math.floor(finalIndex / 2));
  const driverNode = hasRoute ? path[driverIndex] : tracking.riderNode;
  const pickupNode = hasRoute ? path[pickupIndex] : tracking.restaurantNode;
  const dropoffNode = hasRoute ? path[finalIndex] : tracking.customerNode;
  const phase = getPhase(hasActiveOrder, hasRoute, driverIndex, pickupIndex, finalIndex);
  const subtotal = Number(tracking.subtotal ?? trackingItems.reduce((total, item) => total + Number(item.price || 0), 0));
  const total = Number(tracking.total ?? subtotal + Number(tracking.deliveryFee || 0) + Number(tracking.platformFee || 0));
  const mapEmptyTitle = isLoading
    ? "Loading tracking"
    : loadError
      ? "Tracking unavailable"
      : hasActiveOrder
        ? hasRoute ? "" : "Awaiting dispatch"
        : "No active order right now";
  const mapEmptyMessage = isLoading
    ? "Fetching your latest order and rider locations."
    : loadError
      ? loadError
      : hasActiveOrder
        ? hasRoute ? "" : "No active route assigned yet"
        : "Place an order to start live tracking.";

  function loadTracking() {
    setIsLoading(true);
    setLoadError("");
    // Customer tracking is the source of truth after checkout.
    return fetchJson("/live/customer/tracking")
      .then((data) => {
        setTracking(data);
        const orderId = data.order?.id || data.route?.orderId;
        setRouteStartTime(data.route ? getStoredStartTime(orderId, data.order?.timestamp) : 0);
        setSimulationNow(Date.now());
      })
      .catch((error) => {
        console.error("Failed to load tracking:", error);
        setLoadError("Could not load active order tracking. Please check the backend connection.");
      })
      .finally(() => setIsLoading(false));
  }

  function loadMapData() {
    // With no active order, show real rider locations instead of fake cafe/order markers.
    return Promise.all([
      fetchJson("/live/locations"),
      fetchJson("/live/users").catch(() => [])
    ])
      .then(([campusLocations, users]) => {
        const safeLocations = Array.isArray(campusLocations) ? campusLocations : [];
        setLocations(safeLocations);

        const locationsByNodeId = new Map(safeLocations.map((location) => [location.nodeId, location]));
        const safeUsers = Array.isArray(users) ? users : [];
        setRiderLocations(safeUsers
          .filter((user) => user.role?.toLowerCase() === "rider" && user.currentNodeId)
          .map((rider) => {
            const node = locationsByNodeId.get(rider.currentNodeId);
            return {
              ...rider,
              nodeName: node?.name || rider.currentNodeId,
              latitude: node?.latitude || 0,
              longitude: node?.longitude || 0
            };
          }));
      })
      .catch((error) => {
        console.error("Failed to load rider map data:", error);
      });
  }

  function markOrderReceived() {
    setIsCompletingOrder(true);
    setCompletionMessage("");
    // Completing an order clears the active DB-backed tracking state, then shows the rating modal.
    postJson("/orders/received")
      .then((result) => {
        if (route?.orderId) {
          window.localStorage.removeItem(trackingStorageKey(route.orderId));
        }
        setTracking(emptyTracking);
        setRouteStartTime(0);
        setSimulationNow(Date.now());
        setCompletionMessage(result.message || "Hope you enjoy your meal!");
        setSelectedRating(0);
        setShowCompletionModal(true);
      })
      .catch((error) => {
        console.error("Failed to complete delivery:", error);
        setCompletionMessage("Could not complete delivery. Please try again.");
      })
      .finally(() => {
        setIsCompletingOrder(false);
      });
  }

  useEffect(() => {
    loadTracking();
    loadMapData();
  }, []);

  useEffect(() => {
    if (!hasRoute || driverIndex >= finalIndex) {
      return undefined;
    }

    // The timer only advances the front-end marker; the route itself still comes from the backend.
    const timer = window.setInterval(() => {
      setSimulationNow(Date.now());
    }, DRIVER_STEP_MS);

    return () => window.clearInterval(timer);
  }, [driverIndex, finalIndex, hasRoute]);

  const trackingSteps = [
    // The second line under each step is intentionally separate so long names do not jam together.
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
          <h2>{isLoading ? "Loading tracking..." : loadError ? "Tracking unavailable" : phase.headline}</h2>
          <span>{isLoading ? "Fetching your latest order from the backend." : loadError || phase.description}</span>
        </div>
        {!loadError && <span className={`status-chip ${hasActiveOrder ? "blue" : "amber"}`}>{phase.status}</span>}
      </section>

      <section className="card tracking-map-card">
        <div className="tracking-map-toolbar">
          <div>
            <strong>{hasActiveOrder ? `Order ${order.id || tracking.orderId || "pending"}` : "UM campus delivery map"}</strong>
            <span>{hasActiveOrder ? hasRoute ? `${Number(tracking.distanceKm || route.totalDistanceKm).toFixed(2)} km route - ${Number(tracking.eta || route.estimatedTimeMinutes).toFixed(0)} min ETA` : "Waiting for rider assignment" : `${riderLocations.length} rider location(s) from backend`}</span>
          </div>
          {hasActiveOrder ? (
            <button className="primary-button" type="button" onClick={() => onNavigate("map-tracker")}>
              View Full Map
              <span className="material-symbols-outlined">open_in_full</span>
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={() => onNavigate("browse-menu")}>Browse Menu</button>
          )}
        </div>

        <div className="tracking-map" style={{ height: 360, overflow: "hidden", borderRadius: 16 }}>
          <DeliveryMapView
            dropoffNode={tracking.customerNode}
            dropoffNodeId={tracking.dropoffNodeId}
            emptyAction={!hasActiveOrder && !isLoading && !loadError ? <button className="primary-button" type="button" onClick={() => onNavigate("browse-menu")}>Browse Menu</button> : null}
            emptyMessage={mapEmptyMessage}
            emptyTitle={mapEmptyTitle}
            activeRiders={!hasActiveOrder ? riderLocations : []}
            locations={locations}
            pickupNode={tracking.restaurantNode}
            pickupNodeId={tracking.pickupNodeId}
            riderName={tracking.riderName || order.rider || route?.assignedRiderId}
            riderNode={tracking.riderNode}
            routeDriverIndex={driverIndex}
            routeSummary={hasActiveOrder ? route : null}
            showLocationsWhenNoRoute={false}
          />
        </div>
      </section>

      {hasActiveOrder && (
      <section className="tracking-layout">
        <div className="tracking-left-column">
          <article className="card rider-card compact-tracking-card">
            <div className="card-header">
              <h3>Assigned Rider</h3>
              <span className={`status-chip ${hasRoute ? "green" : "amber"}`}>{tracking.riderName || order.rider || route?.assignedRiderId || "Pending"}</span>
            </div>
            <div className="rider-profile">
              <div className="rider-avatar">{(tracking.riderName || order.rider || route?.assignedRiderId || "DR").slice(0, 2)}</div>
              <div>
                <strong>{tracking.riderName || order.rider || route?.assignedRiderId || "Waiting for rider assignment"}</strong>
                <span>{driverNode?.name || "Rider location will appear after assignment"}</span>
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
            {trackingItems.map((item) => (
              <div className="tracking-summary-row" key={`${item.itemId}-${item.name}`}>
                <span>1x</span>
                <strong>{item.name}</strong>
                <dd>RM {Number(item.price).toFixed(2)}</dd>
              </div>
            ))}
            {trackingItems.length === 0 && <p className="muted">No dispatched order items yet.</p>}
          </div>

          <dl className="tracking-costs">
            <div><dt>Subtotal</dt><dd>RM {subtotal.toFixed(2)}</dd></div>
            <div><dt>Delivery fee</dt><dd>RM {Number(tracking.deliveryFee || 0).toFixed(2)}</dd></div>
            <div><dt>Tax / platform fee</dt><dd>RM {Number(tracking.platformFee || 0).toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {total.toFixed(2)}</dd></div>
          </dl>
          {phase.activeStep === 4 && route && (
            <button className="primary-button full" type="button" onClick={markOrderReceived} disabled={isCompletingOrder}>
              <span className="material-symbols-outlined">task_alt</span>
              {isCompletingOrder ? "Completing..." : "Order Received"}
            </button>
          )}
          {completionMessage && <p className="muted">{completionMessage}</p>}
        </article>
      </section>
      )}

      {showCompletionModal && (
        <div className="meal-completion-overlay" role="dialog" aria-modal="true" aria-labelledby="meal-completion-title">
          <article className="meal-completion-modal">
            <div className="meal-completion-icon">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
            <p className="eyebrow">Delivery completed</p>
            <h3 id="meal-completion-title">Hope you enjoy your meal!</h3>
            <p>Your order has been cleared from live tracking. Rate your delivery experience.</p>

            <div className="meal-rating-row" aria-label="Rate your delivery">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                  className={rating <= selectedRating ? "selected" : ""}
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>

            <div className="meal-completion-actions">
              <button className="secondary-button" type="button" onClick={() => setShowCompletionModal(false)}>
                Close
              </button>
              <button className="primary-button" type="button" onClick={() => onNavigate("browse-menu")}>
                Browse Menu
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
