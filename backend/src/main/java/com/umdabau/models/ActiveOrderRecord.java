package com.umdabau.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

/**
 * Persisted snapshot of an active delivery.
 * Used to rebuild tracking and dispatch state after the backend restarts.
 */
@Entity
@Table(name = "active_orders")
public class ActiveOrderRecord {
    @Id
    private String orderId;
    private String customerId;
    private String restaurantId;
    private String assignedRiderId;
    private String deliveryNodeId;
    private String pickupNodeId;
    private String dropoffNodeId;
    private String riderNodeId;
    private String status;
    private long timestamp;
    private double subtotal;
    private double deliveryFee;
    private double platformFee;
    private double total;
    private double totalDistanceKm;
    private double estimatedTimeMinutes;
    private boolean active;

    @Lob
    // Stored as JSON because the order can contain several menu items.
    private String itemsJson;

    public ActiveOrderRecord() {
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getAssignedRiderId() {
        return assignedRiderId;
    }

    public void setAssignedRiderId(String assignedRiderId) {
        this.assignedRiderId = assignedRiderId;
    }

    public String getDeliveryNodeId() {
        return deliveryNodeId;
    }

    public void setDeliveryNodeId(String deliveryNodeId) {
        this.deliveryNodeId = deliveryNodeId;
    }

    public String getPickupNodeId() {
        return pickupNodeId;
    }

    public void setPickupNodeId(String pickupNodeId) {
        this.pickupNodeId = pickupNodeId;
    }

    public String getDropoffNodeId() {
        return dropoffNodeId;
    }

    public void setDropoffNodeId(String dropoffNodeId) {
        this.dropoffNodeId = dropoffNodeId;
    }

    public String getRiderNodeId() {
        return riderNodeId;
    }

    public void setRiderNodeId(String riderNodeId) {
        this.riderNodeId = riderNodeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(double deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public double getPlatformFee() {
        return platformFee;
    }

    public void setPlatformFee(double platformFee) {
        this.platformFee = platformFee;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public double getEstimatedTimeMinutes() {
        return estimatedTimeMinutes;
    }

    public void setEstimatedTimeMinutes(double estimatedTimeMinutes) {
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getItemsJson() {
        return itemsJson;
    }

    public void setItemsJson(String itemsJson) {
        this.itemsJson = itemsJson;
    }
}
