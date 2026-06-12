package com.umdabau.data_structures;

import com.umdabau.models.GraphNode;

/**
 * One road connection in the campus graph.
 * Edges are stored as linked nodes from each GraphNode's firstEdge pointer.
 */
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
