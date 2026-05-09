public class Order {
    String orderId;         // e.g., "ORD-001"
    String customerId;      
    String restaurantId;    
    String assignedRiderId; // Starts as null
    
    CartStack<MenuItem> cart  // The Stack! Allows O(1) Undo operations
    double totalPrice;
    
    long timestamp;         // System.currentTimeMillis() - used for Queue FIFO sorting
    String status;          // "CART", "PENDING", "DISPATCHED", "DELIVERED"
    String deliveryNodeId;  // Where is the customer?
}