import React, { useEffect, useMemo, useState } from "react";

const deliveryFee = 2.5;
const platformFee = 0.8;

export default function CartPreview({ items = [], isLoading = false, onRefreshCart = () => {}, onUndoLastCartItem = () => {}, onAddItem = () => {}, onRemoveItem = () => {}, onRemoveAllItem = () => {} }) {
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.qty, 0), [items]);

  useEffect(() => {
    onRefreshCart();
  }, [onRefreshCart]);

  function checkout() {
    setCheckoutMessage("");

    fetch("http://localhost:8080/api/orders/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        return response.text();
      })
      .then((message) => {
        setCheckoutMessage(message);
        onRefreshCart();
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
          <span>Review campus delivery items from the Spring Boot cart stack.</span>
        </div>
      </section>

      <section className="cart-delivery-address card">
        <span className="material-symbols-outlined">location_on</span>
        <div>
          <p className="eyebrow">Deliver to</p>
          <strong>Engineering Block C, Room 304</strong>
          <small>Contactless drop-off at lobby counter.</small>
        </div>
      </section>

      <section className="cart-layout">
        <article className="card order-items-card">
          <div className="card-header cart-card-header">
            <div>
              <p className="eyebrow">Java cart stack preview</p>
              <h3>Order Items</h3>
            </div>
            <button className="secondary-button small-button" type="button" onClick={onUndoLastCartItem} disabled={isLoading}>
              <span className="material-symbols-outlined">undo</span>
              Undo Last Action
            </button>
          </div>
          <div className="cart-items-list">
            {isLoading && <p className="muted">Loading cart from backend...</p>}
            {items.map((item) => (
              <div className="cart-line-item" key={item.id}>
                <div className="cart-thumb">
                  <span>{item.name.charAt(0)}</span>
                </div>
                <div className="cart-item-copy">
                  <strong>{item.name}</strong>
                  <span>{item.note} &middot; Backend cart item</span>
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
              <small>Campus lunch promo placeholder</small>
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
            <div><dt>Delivery fee</dt><dd>RM {deliveryFee.toFixed(2)}</dd></div>
            <div><dt>Platform fee</dt><dd>RM {platformFee.toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {(subtotal + deliveryFee + platformFee).toFixed(2)}</dd></div>
          </dl>
          <div className="cart-actions">
            <button className="primary-button full checkout-button" type="button" onClick={checkout} disabled={isLoading || items.length === 0}>Proceed to Checkout</button>
            {checkoutMessage && <p className="muted">{checkoutMessage}</p>}
            <p className="secure-note cart-secure-note">
              <span className="material-symbols-outlined">lock</span>
              Secure Payment placeholder only. Checkout queues the order for dispatch.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
