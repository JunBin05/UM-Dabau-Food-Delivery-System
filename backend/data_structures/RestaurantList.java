public class RestaurantList {
    private class Node {
        Restaurant data;
        Node next;
        public Node(Restaurant data) { this.data = data; }
    }
    private Node head;
    
    public void add(Restaurant r) { /* Logic */ }
    public Restaurant getById(String id) { /* Logic */ }
    public Restaurant[] getAll() { /* Logic */ } 
}