package com.umdabau.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.data_structures.CartStack;
import com.umdabau.models.MenuItem;
import com.umdabau.models.Order;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class OrderController {

    private final CartStack activeCart = new CartStack();
    private CartAction lastCartAction;
    
    @Autowired
    private DeliveryService deliveryService; // <-- Talk to the Service, not another Controller!

    @PostMapping("/cart/add")
    public ResponseEntity<String> addToCart(@RequestBody MenuItem item) {
        System.out.println("Received cart item: " + item.getName());
        activeCart.push(item);
        lastCartAction = new CartAction("ADD", item, 1);
        return ResponseEntity.ok("Item added.");
    }

    @GetMapping("/cart")
    public ResponseEntity<List<MenuItem>> getCartItems() {
        return ResponseEntity.ok(activeCart.toList());
    }

    @GetMapping("/cart/count")
    public ResponseEntity<Integer> getCartCount() {
        return ResponseEntity.ok(activeCart.getSize());
    }

    @PostMapping("/cart/undo")
    public ResponseEntity<String> undoLastCartAction() {
        if (lastCartAction == null) {
            return ResponseEntity.badRequest().body("No cart action to undo.");
        }

        if ("ADD".equals(lastCartAction.type)) {
            MenuItem removedItem = activeCart.removeOne(lastCartAction.item);

            if (removedItem == null) {
                return ResponseEntity.notFound().build();
            }
        } else if ("REMOVE_ONE".equals(lastCartAction.type)) {
            activeCart.push(lastCartAction.item);
        } else if ("REMOVE_ALL".equals(lastCartAction.type)) {
            for (int i = 0; i < lastCartAction.count; i++) {
                activeCart.push(lastCartAction.item);
            }
        }

        lastCartAction = null;
        return ResponseEntity.ok("Last cart action undone.");
    }

    @PostMapping("/cart/remove")
    public ResponseEntity<MenuItem> removeOneCartItem(@RequestBody MenuItem item) {
        MenuItem removedItem = activeCart.removeOne(item);

        if (removedItem == null) {
            return ResponseEntity.notFound().build();
        }

        lastCartAction = new CartAction("REMOVE_ONE", removedItem, 1);
        return ResponseEntity.ok(removedItem);
    }

    @PostMapping("/cart/remove-all")
    public ResponseEntity<String> removeAllCartItems(@RequestBody MenuItem item) {
        int removedCount = activeCart.removeAll(item);

        if (removedCount == 0) {
            return ResponseEntity.notFound().build();
        }

        lastCartAction = new CartAction("REMOVE_ALL", item, removedCount);
        return ResponseEntity.ok("Removed " + removedCount + " item(s).");
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkoutOrder(@RequestBody Order newOrder) {
        newOrder.cart = this.activeCart; 
        newOrder.status = "PENDING_DISPATCH";
        
        // Put the order into the globally shared queue!
        deliveryService.getOrderQueue().enqueue(newOrder);
        
        return ResponseEntity.ok("Order queued! Pending orders: " + deliveryService.getOrderQueue().getSize());
    }

    private static class CartAction {
        private final String type;
        private final MenuItem item;
        private final int count;

        private CartAction(String type, MenuItem item, int count) {
            this.type = type;
            this.item = item;
            this.count = count;
        }
    }
}
