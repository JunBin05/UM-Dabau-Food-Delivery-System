package com.umdabau.models;

/**
 * Result returned by Dijkstra after calculating a delivery route.
 * The path is an ordered array of graph nodes from start to destination.
 */
public class RouteSummary {
    private String orderId;
    private String assignedRiderId;
    private GraphNode[] path;
    private double totalDistanceKm;
    private double estimatedTimeMinutes;

    // Default constructor lets Spring/Jackson serialize and deserialize this object.
    public RouteSummary() {
    }

    // Used by UMGraph after it rebuilds the shortest path.
    public RouteSummary(String orderId, String assignedRiderId, GraphNode[] path, double totalDistanceKm,
            double estimatedTimeMinutes) {
        this.orderId = orderId;
        this.assignedRiderId = assignedRiderId;
        this.path = path;
        this.totalDistanceKm = totalDistanceKm;
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    // Getters and setters keep the route response JSON-friendly.
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
