package com.umdabau.models;

/**
 * One physical point in the UM campus graph.
 * It can be a cafe, hostel, faculty, junction, or hidden waypoint for route shaping.
 */
public class GraphNode {
    public String nodeId; // e.g., "NODE_FSKTM"
    public String name; // e.g., "Faculty of Computer Science"
    public double latitude; // Real GPS coord
    public double longitude; // Real GPS coord

    public GraphNode(String nodeId, String name, double latitude, double longitude) {
        this.nodeId = nodeId;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
