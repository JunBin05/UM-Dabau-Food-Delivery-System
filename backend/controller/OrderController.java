package controller;

import data_structures.CartStack;
import data_structures.OrderQueue;
import models.MenuItem;
import models.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CartStack activeCart = new CartStack();
    private final OrderQueue pendingOrders = new OrderQueue();

    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(@RequestBody MenuItem item) {
        activeCart.push(item);
        return ResponseEntity.ok("Item added. Cart size: " + activeCart.getSize());
    }

    @PostMapping("/cart/undo")
    public ResponseEntity<MenuItem> undoLastCartItem() {
        if (activeCart.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }
        MenuItem removedItem = activeCart.pop();
        return ResponseEntity.ok(removedItem);
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkoutOrder(@RequestBody Order newOrder) {
        newOrder.cart = this.activeCart; 
        newOrder.status = "PENDING_DISPATCH";
        
        pendingOrders.enqueue(newOrder);
        return ResponseEntity.ok("Order queued! Pending orders: " + pendingOrders.getSize());
    }
    
    public OrderQueue getPendingOrders() {
        return pendingOrders;
    }
}