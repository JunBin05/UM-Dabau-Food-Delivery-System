package com.umdabau.models;

import com.umdabau.data_structures.Edge;

/**
 * One physical point in the UM campus graph.
 * It can be a cafe, hostel, faculty, junction, or hidden waypoint for route shaping.
 * firstEdge points to the linked list of roads leaving this node.
 */
public class GraphNode {
    public String nodeId; // e.g., "NODE_FSKTM"
    public String name; // e.g., "Faculty of Computer Science"
    public double latitude; // Real GPS coord
    public double longitude; // Real GPS coord
    public transient Edge firstEdge;

    public GraphNode(String nodeId, String name, double latitude, double longitude) {
        this.nodeId = nodeId;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.firstEdge = null;
    }
}
