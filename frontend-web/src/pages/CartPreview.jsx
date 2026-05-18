import React, { useMemo, useState } from "react";
import { cartItems } from "../data/mockData.js";

const deliveryFee = 2.5;
const platformFee = 0.8;

export default function CartPreview() {
  const [items, setItems] = useState(cartItems);
  const [lastRemoved, setLastRemoved] = useState(null);
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.qty, 0), [items]);

  function updateQuantity(itemId, delta) {
    setItems((current) =>
      current.map((item) => item.id === itemId ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
    );
  }

  function deleteItem(itemId) {
    setItems((current) => {
      const removed = current.find((item) => item.id === itemId);
      if (removed) {
        setLastRemoved(removed);
      }
      return current.filter((item) => item.id !== itemId);
    });
  }

  function undoLastItem() {
    if (!lastRemoved) {
      return;
    }
    setItems((current) => [lastRemoved, ...current]);
    setLastRemoved(null);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Customer cart</p>
          <h2>Cart Preview</h2>
          <span>Local placeholder cart only. Checkout integration is intentionally not wired yet.</span>
        </div>
      </section>

      <section className="cart-layout">
        <article className="card order-items-card">
          <div className="card-header cart-card-header">
            <div>
              <p className="eyebrow">Local cart stack preview</p>
              <h3>Order Items</h3>
            </div>
            <button className="secondary-button small-button" type="button" onClick={undoLastItem} disabled={!lastRemoved}>
              <span className="material-symbols-outlined">undo</span>
              Undo Last Item
            </button>
          </div>
          <div className="cart-items-list">
            {items.map((item) => (
              <div className="cart-line-item" key={item.id}>
                <div className="cart-thumb">
                  <span>{item.name.charAt(0)}</span>
                </div>
                <div className="cart-item-copy">
                  <strong>{item.name}</strong>
                  <span>{item.note} &middot; Campus mock item</span>
                  <small>RM {item.price.toFixed(2)} each</small>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">-</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <strong>RM {(item.price * item.qty).toFixed(2)}</strong>
                </div>
                <button className="icon-delete-button" type="button" onClick={() => deleteItem(item.id)} aria-label={`Delete ${item.name}`}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
            {items.length === 0 && <p className="muted">Cart is empty. Add menu items later when backend integration is ready.</p>}
          </div>
        </article>

        <article className="card summary-card cart-summary-card">
          <div>
            <p className="eyebrow">Checkout preview</p>
            <h3>Order Summary</h3>
          </div>
          <dl>
            <div><dt>Subtotal</dt><dd>RM {subtotal.toFixed(2)}</dd></div>
            <div><dt>Delivery fee</dt><dd>RM {deliveryFee.toFixed(2)}</dd></div>
            <div><dt>Platform fee</dt><dd>RM {platformFee.toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>RM {(subtotal + deliveryFee + platformFee).toFixed(2)}</dd></div>
          </dl>
          <div className="cart-actions">
            <button className="primary-button full checkout-button" type="button">Proceed to Checkout</button>
            <p className="secure-note cart-secure-note">
              <span className="material-symbols-outlined">lock</span>
              Secure Payment placeholder only. No checkout or backend call is connected.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
