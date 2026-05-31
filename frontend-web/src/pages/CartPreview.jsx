import React, { useMemo, useState } from "react";
import { cartItems } from "../data/mockData.js";

const deliveryFee = 2.5;
const platformFee = 0.8;

export default function CartPreview({ items: sharedItems, setItems: setSharedItems }) {
  const [localItems, setLocalItems] = useState(cartItems);
  const [lastRemoved, setLastRemoved] = useState(null);
  const items = sharedItems ?? localItems;
  const setItems = setSharedItems ?? setLocalItems;
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
    <div className="page-stack app-cart-page">
      <section className="page-heading cart-app-heading">
        <div>
          <p className="eyebrow">Customer cart</p>
          <h2>Cart Preview</h2>
          <span>Review campus delivery items before the placeholder checkout step.</span>
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
            {items.length === 0 && <p className="muted">Cart is empty. Add menu items from Browse Menu.</p>}
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
            <button className="primary-button full checkout-button" type="button">Proceed to Checkout</button>
            <p className="secure-note cart-secure-note">
              <span className="material-symbols-outlined">lock</span>
              Secure Payment placeholder only. No checkout is connected.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
