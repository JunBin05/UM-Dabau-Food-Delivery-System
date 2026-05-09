public class UserList {
    
    // Internal Node class for the custom Linked List
    private class Node {
        User data;
        Node next;
        
        public Node(User data) { 
            this.data = data; 
            this.next = null;
        }
    }
    
    private Node head;
    private int size;
    
    public UserList() {
        this.head = null;
        this.size = 0;
    }
    
    // Required Core Methods
    public void add(User u) { /* Logic to append to end of list */ }
    public User getById(String userId) { /* Logic to traverse and find */ }
    
    // Returns a perfectly sized standard array for the Spring Boot Controller
    public User[] getAll() { 
        User[] allUsers = new User[size];
        // Logic to traverse the linked list and fill the array
        return allUsers; 
    } 
}