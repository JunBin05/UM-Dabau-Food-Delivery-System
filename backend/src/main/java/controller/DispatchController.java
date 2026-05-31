package controller;

import data_structures.OrderQueue;
import data_structures.RiderHeap;
import models.Order;
import models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dispatch")
@CrossOrigin(origins = "http://localhost:5173")
public class DispatchController {

    private final RiderHeap availableRiders = new RiderHeap(100);
    
    @Autowired
    private OrderController orderController;

    @PostMapping("/rider/clock-in")
    public ResponseEntity<String> clockInRider(@RequestBody User rider, @RequestParam double distanceToRestaurant) {
        availableRiders.insert(rider, distanceToRestaurant);
        return ResponseEntity.ok("Rider added to dispatch pool.");
    }

    @PostMapping("/assign")
    public ResponseEntity<String> assignNextOrder() {
        OrderQueue sharedQueue = orderController.getPendingOrders();
        
        if (sharedQueue.isEmpty() || availableRiders.isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot dispatch. Queue empty or no riders available.");
        }

        Order nextOrder = sharedQueue.dequeue();
        User bestRider = availableRiders.extractBestRider();

        nextOrder.status = "DISPATCHED";
        nextOrder.assignedRiderId = bestRider.userId; // Assuming User has a userId string
        
        return ResponseEntity.ok("Success! Order assigned to nearest rider.");
    }
}