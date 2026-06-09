package com.umdabau.data_structures;

import com.umdabau.models.GraphNode;

/**
 * One road connection in the campus graph.
 * Edges are stored as linked nodes inside each vertex's adjacency list.
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
