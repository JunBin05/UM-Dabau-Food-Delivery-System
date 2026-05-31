package com.umdabau.models;

public class GraphNode {
    public String nodeId; // e.g., "NODE_FSKTM"
    public String name; // e.g., "Faculty of Computer Science"
    public double latitude; // Real GPS coord
    public double longitude; // Real GPS coord

    // --- 1. Constructor for Easy Setup ---
    public GraphNode(String nodeId, String name, double latitude, double longitude) {
        this.nodeId = nodeId;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}