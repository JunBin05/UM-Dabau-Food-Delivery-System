package com.umdabau.models;

import com.umdabau.datastructures.CartStack;

/**
 * Represents a customer's food delivery order in the UM-Dabau system.
 */
public class Order {
    
    public String orderId;          // e.g., "ORD-001"
    public String customerId;       // ID of the user placing the order
    public String restaurantId;     // ID of the restaurant preparing the food
    public String assignedRiderId;  // Starts as null until dispatched
    
    public CartStack cart;          // The Stack! Allows O(1) Undo operations
    public double totalPrice;       // Total cost of the order
    
    public long timestamp;          // System.currentTimeMillis() - used for Queue FIFO sorting
    public String status;           // "CART", "PENDING", "DISPATCHED", "DELIVERED"
    public String deliveryNodeId;   // Where is the customer located?

    /**
     * Constructor to initialize a fresh order when a customer starts shopping.
     */
    public Order(String orderId, String customerId, String restaurantId, String deliveryNodeId) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.deliveryNodeId = deliveryNodeId;
        
        // Default system initializations
        this.assignedRiderId = null;                 // No rider assigned initially
        this.cart = new CartStack();                 // Initializes the custom stack
        this.totalPrice = 0.0;                       // Starts at zero
        this.timestamp = System.currentTimeMillis(); // Stamps the exact creation time
        this.status = "CART";                        // Initial state before checkout
    }
}