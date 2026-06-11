import React, { useEffect, useMemo, useState } from "react";
import { fetchJson, postJson, putJson } from "../api/liveApi.js";

const CUSTOMER_ID = "USR-001";

function distanceKm(pointA, pointB) {
  // Haversine distance, used only to choose the nearest saved delivery point in the browser.
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDistance = toRadians(pointB.latitude - pointA.latitude);
  const lngDistance = toRadians(pointB.longitude - pointA.longitude);
  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);
  const haversine = Math.sin(latDistance / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDistance / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function CartPreview({ items = [], isLoading = false, undoAvailable = false, onRefreshCart = () => {}, onUndoLastCartItem = () => {}, onAddItem = () => {}, onRemoveItem = () => {}, onRemoveAllItem = () => {}, onNavigate = () => {} }) {
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [delivery, setDelivery] = useState({ deliveryAddress: "Loading delivery point...", deliveryNodeId: "NODE_KK12_BLOCK_A", distanceKm: 0, deliveryFee: 0, platformFee: 0 });
  const [locations, setLocations] = useState([]);
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const canUndo = undoAvailable;
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.qty, 0), [items]);

  useEffect(() => {
    onRefreshCart();

    // Load cart page data in one pass: saved customer location, all map locations, and home fee defaults.
    Promise.all([
      fetchJson("/live/customer/home").catch((error) => {
        console.error("Failed to load delivery point:", error);
        return null;
      }),
      fetchJson("/live/locations").catch((error) => {
        console.error("Failed to load delivery locations:", error);
        return [];
      }),
      fetchJson("/live/users").catch((error) => {
        console.error("Failed to load saved customer location:", error);
        return [];
      })
    ]).then(([home, loadedLocations, users]) => {
      const customer = Array.isArray(users) ? users.find((user) => user.userId === CUSTOMER_ID) : null;
      const savedNodeId = customer?.currentNodeId || home?.deliveryNodeId || "NODE_KK12_BLOCK_A";
      const savedLocation = loadedLocations.find((location) => location.nodeId === savedNodeId);

      setLocations(loadedLocations);
      setDelivery({
        deliveryAddress: savedLocation?.name || home?.deliveryAddress || savedNodeId,
        deliveryNodeId: savedNodeId,
        distanceKm: home?.distanceKm ?? 0,
        deliveryFee: home?.deliveryFee ?? 0,
        platformFee: home?.platformFee ?? 0
      });
    });
  }, [onRefreshCart]);

  useEffect(() => {
    const restaurantId = items.find((item) => item.restaurantId)?.restaurantId || "";

    if (!restaurantId) {
      setDelivery((current) => ({
        ...current,
        distanceKm: 0,
        deliveryFee: 0,
        platformFee: 0
      }));
      return;
    }

    let isCancelled = false;

    // Recalculate delivery fees whenever the cart restaurant or delivery node changes.
    postJson("/orders/fees", {
      restaurantId,
      deliveryNodeId: delivery.deliveryNodeId
    })
      .then((feeQuote) => {
        if (isCancelled) {
          return;
        }

        setDelivery((current) => ({
          ...current,
          distanceKm: feeQuote.distanceKm ?? 0,
          deliveryFee: feeQuote.deliveryFee ?? 0,
          platformFee: feeQuote.platformFee ?? 0
        }));
      })
      .catch((error) => {
        console.error("Failed to calculate delivery fees:", error);
      });

    return () => {
      isCancelled = true;
    };
  }, [delivery.deliveryNodeId, items]);

  function saveDeliveryNode(nodeId, location) {
    // Preferred endpoint stores location directly; fallback supports older backend versions.
    return putJson("/live/customer/location", { deliveryNodeId: nodeId })
      .catch((error) => {
        console.warn("Primary delivery location endpoint failed, falling back to user update:", error);
        return fetchJson("/live/users")
          .then((users) => {
            const customer = Array.isArray(users) ? users.find((user) => user.userId === CUSTOMER_ID) : null;
            if (!customer) {
              throw new Error("Customer user not found.");
            }

            return putJson(`/live/users/${CUSTOMER_ID}`, {
              ...customer,
              currentNodeId: nodeId
            });
          })
          .then(() => ({
            deliveryNodeId: nodeId,
            deliveryAddress: location?.name || nodeId
          }));
      });
  }

  function selectDeliveryNode(nodeId, sourceMessage = "") {
    const location = locations.find((entry) => entry.nodeId === nodeId);

    // Update the UI immediately, then persist the same node to the backend.
    setDelivery((current) => ({
      ...current,
      deliveryNodeId: nodeId,
      deliveryAddress: location?.name || nodeId
    }));
    setIsSavingLocation(true);
    setLocationMessage(sourceMessage || "Saving delivery location...");

    saveDeliveryNode(nodeId, location)
      .then((savedLocation) => {
        setDelivery((current) => ({
          ...current,
          deliveryNodeId: savedLocation.deliveryNodeId || nodeId,
          deliveryAddress: savedLocation.deliveryAddress || location?.name || nodeId
        }));
        setLocationMessage(sourceMessage || "Delivery location saved.");
      })
      .catch((error) => {
        console.error("Failed to save delivery location:", error);
        setLocationMessage("Could not save delivery location. Please try again.");
      })
      .finally(() => setIsSavingLocation(false));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Current location is not available in this browser.");
      return;
    }

    if (locations.length === 0) {
      setLocationMessage("Delivery locations are still loading.");
      return;
    }

    setIsLocating(true);
    setLocationMessage("Finding nearest campus delivery point...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        // Pick the nearest supported campus node rather than saving raw GPS coordinates.
        const nearestLocation = locations
          .map((location) => ({ ...location, distance: distanceKm(currentPoint, location) }))
          .sort((first, second) => first.distance - second.distance)[0];

        if (nearestLocation) {
          selectDeliveryNode(nearestLocation.nodeId, `Nearest point selected: ${nearestLocation.name}.`);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Failed to use browser location:", error);
        setLocationMessage("Could not access current location. Please select a delivery point.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
    );
  }

  function checkout() {
    setCheckoutMessage("");

    // Checkout sends the selected delivery node; backend handles cart snapshot and dispatch.
    postJson("/orders/checkout", {
      customerId: "USR-001",
      deliveryNodeId: delivery.deliveryNodeId
    })
      .then((checkoutResult) => {
        setCheckoutMessage(checkoutResult.message);
        onRefreshCart();
        window.setTimeout(() => onNavigate("order-tracking"), 900);
      })
      .catch((error) => {
        console.error("Failed to checkout order:", error);
        setCheckoutMessage("Checkout failed. Please try again.");
      });
  }

  return (
    <div className="page-stack app-cart-page">
      <section className="page-heading cart-app-heading">
        <div>
          <p className="eyebrow">Customer cart</p>
          <h2>Cart Preview</h2>
          <span>Review your campus meals before checkout.</span>
        </div>
      </section>

      <section className="cart-delivery-address card">
        <span className="material-symbols-outlined">location_on</span>
        <div>
          <p className="eyebrow">Deliver to</p>
          <strong>{delivery.deliveryAddress}</strong>
          <small>{delivery.deliveryNodeId}</small>
          <div className="delivery-location-controls">
            <select value={delivery.deliveryNodeId} onChange={(event) => selectDeliveryNode(event.target.value)} disabled={isSavingLocation}>
              {locations.map((location) => (
                <option value={location.nodeId} key={location.nodeId}>{location.name}</option>
              ))}
            </select>
            <button className="secondary-button small-button" type="button" onClick={useCurrentLocation} disabled={isLocating || isSavingLocation}>
              <span className="material-symbols-outlined">my_location</span>
              {isLocating ? "Locating" : "Use Current Location"}
            </button>
          </div>
          {isSavingLocation && <small>Saving your delivery point...</small>}
          {locationMessage && <small>{locationMessage}</small>}
        </div>
      </section>

      <section className="cart-layout">
        <article className="card order-items-card">
          <div className="card-header cart-card-header">
            <div>
              <p className="eyebrow">Your order</p>
              <h3>Order Items</h3>
            </div>
            <button className="secondary-button small-button" type="button" onClick={onUndoLastCartItem} disabled={isLoading || !canUndo}>
              <span className="material-symbols-outlined">undo</span>
              Undo Last Action
            </button>
          </div>
          <div className="cart-items-list">
            {isLoading && <p className="muted">Loading your cart...</p>}
            {items.map((item) => (
              <div className="cart-line-item" key={item.id}>
                <div className="cart-thumb">
                  <span>{item.name.charAt(0)}</span>
                </div>
                <div className="cart-item-copy">
                  <strong>{item.name}</strong>
                  <span>{item.note} &middot; Campus delivery item</span>
                  <small>RM {item.price.toFixed(2)} each</small>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => onRemoveItem(item)} aria-label={`Remove one ${item.name}`}>-</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => onAddItem(item)} aria-label={`Add one ${item.name}`}>+</button>
                  </div>
                  <strong>RM {(item.price * item.qty).toFixed(2)}</strong>
                </div>
                <button className="icon-delete-button" type="button" onClick={() => onRemoveAllItem(item)} aria-label={`Remove all ${item.name}`}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
            {!isLoading && items.length === 0 && <p className="muted">Cart is empty. Add menu items from Browse Menu.</p>}
          </div>
        </article>

        <article className="card summary-card cart-summary-card">
          <div>
            <p className="eyebrow">Checkout preview</p>
            <h3>Order Summary</h3>
          </div>
          <div className="checkout-option-card">
            <span className="material-symbols-outlined">sell</span>
            <div>
              <strong>Voucher</strong>
              <small>Live order total preview</small>
            </div>
          </div>
          <div className="checkout-option-card">
            <span className="material-symbols-outlined">payments</span>
            <div>
              <strong>Cash / Mock Wallet</strong>
              <small>Payment method preview only</small>
            </div>
          </div>
          <dl>
            <div><dt>Subtotal</dt><dd>RM {subtotal.toFixed(2)}</dd></div>
            <div><dt>Distance</dt><dd>{Number(delivery.distanceKm || 0).toFixed(2)} km</dd></div>
            <div><dt>Delivery fee</dt><dd>RM {Number(delivery.deliveryFee || 0).toFixed(2)}</dd></div>
            <div><dt>Platform fee</dt><dd>RM {Number(delivery.platformFee || 0).toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {(subtotal + Number(delivery.deliveryFee || 0) + Number(delivery.platformFee || 0)).toFixed(2)}</dd></div>
          </dl>
          <div className="cart-actions">
            <button className="primary-button full checkout-button" type="button" onClick={checkout} disabled={isLoading || items.length === 0}>Proceed to Checkout</button>
            {checkoutMessage && <p className="muted">{checkoutMessage}</p>}
            <p className="secure-note cart-secure-note">
              <span className="material-symbols-outlined">lock</span>
              Checkout queues the order for dispatch.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
