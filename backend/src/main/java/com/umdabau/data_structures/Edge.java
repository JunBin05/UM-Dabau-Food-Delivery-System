package com.umdabau.data_structures;

import com.umdabau.models.GraphNode;

// 1. The Edge Class (Acts as a Linked Node pointing to the next connection)
public class Edge {
    GraphNode targetNode;    
    double distanceKm;       // The passive tracker for the UI Contract
    double baseTimeMinutes;  // The active weight for Dijkstra's math
    Edge nextEdge;           

    public Edge(GraphNode targetNode, double distanceKm, double baseTimeMinutes) {
        this.targetNode = targetNode;
        this.distanceKm = distanceKm;
        this.baseTimeMinutes = baseTimeMinutes;
        this.nextEdge = null;
    }
}
