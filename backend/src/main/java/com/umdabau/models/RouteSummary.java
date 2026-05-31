package com.umdabau.models;

public class RouteSummary {
    private String orderId;
    private String assignedRiderId;
    private GraphNode[] path;
    private double totalDistanceKm;
    private double estimatedTimeMinutes;

    // 1. Default Constructor (Best practice for Spring Boot)
    public RouteSummary() {
    }

    // 2. Parameterized Constructor (Used by your Dijkstra algorithm)
    public RouteSummary(String orderId, String assignedRiderId, GraphNode[] path, double totalDistanceKm,
            double estimatedTimeMinutes) {
        this.orderId = orderId;
        this.assignedRiderId = assignedRiderId;
        this.path = path;
        this.totalDistanceKm = totalDistanceKm;
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    // 3. Getters and Setters (CRITICAL for JSON Serialization)
    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getAssignedRiderId() {
        return assignedRiderId;
    }

    public void setAssignedRiderId(String assignedRiderId) {
        this.assignedRiderId = assignedRiderId;
    }

    public GraphNode[] getPath() {
        return path;
    }

    public void setPath(GraphNode[] path) {
        this.path = path;
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
}