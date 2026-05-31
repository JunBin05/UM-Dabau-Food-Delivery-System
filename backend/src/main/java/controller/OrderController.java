package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import data_structures.CartStack;
import models.MenuItem;
import models.Order;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final CartStack activeCart = new CartStack();
    
    @Autowired
    private DeliveryService deliveryService; // <-- Talk to the Service, not another Controller!

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
        
        // Put the order into the globally shared queue!
        deliveryService.getOrderQueue().enqueue(newOrder);
        
        return ResponseEntity.ok("Order queued! Pending orders: " + deliveryService.getOrderQueue().getSize());
    }
}