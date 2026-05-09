//The Graph Engine
public class UMGraph {
    
    // Array to hold all physical UM Nodes (e.g., FSKTM, Library)
    private GraphNode[] vertices;
    
    // The Adjacency List: index matches the vertices array.
    // Holds the 'head' Edge for each vertex.
    private Edge[] adjacencyList; 
    
    private int numVertices;

    public UMGraph(int capacity) {
        this.vertices = new GraphNode[capacity];
        this.adjacencyList = new Edge[capacity];
        this.numVertices = 0;
    }

    // Required Core Methods
    public void addVertex(GraphNode node) { /* Logic */ }
    
    // Connects two nodes with a specific travel time
    public void addEdge(String sourceNodeId, String targetNodeId, double weightMinutes) { /* Logic */ }
    
    // The ultimate routing algorithm
    public RouteSummary runDijkstra(String startNodeId, String endNodeId) { /* Logic */ }
}