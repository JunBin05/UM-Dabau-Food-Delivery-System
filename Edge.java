// 1. The Edge Class (Acts as a Linked Node pointing to the next connection)
public class Edge {
    GraphNode targetNode;
    double weightMinutes;   // Travel time
    Edge nextEdge;          // Pointer to the next edge in the adjacency list

    public Edge(GraphNode targetNode, double weightMinutes) {
        this.targetNode = targetNode;
        this.weightMinutes = weightMinutes;
        this.nextEdge = null;
    }
}
