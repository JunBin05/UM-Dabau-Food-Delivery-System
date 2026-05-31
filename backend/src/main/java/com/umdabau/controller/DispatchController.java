package com.umdabau.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.models.Order;
import com.umdabau.models.User;

@RestController
@RequestMapping("/api/dispatch")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class DispatchController {

    @Autowired
    private DeliveryService deliveryService; // <-- Shared brain!

    @PostMapping("/rider/clock-in")
    public ResponseEntity<String> clockInRider(@RequestBody User rider, @RequestParam double distanceToRestaurant) {
        deliveryService.getRiderHeap().insert(rider, distanceToRestaurant);
        return ResponseEntity.ok("Rider added to dispatch pool.");
    }

    @PostMapping("/assign")
    public ResponseEntity<String> assignNextOrder() {
        if (deliveryService.getOrderQueue().isEmpty() || deliveryService.getRiderHeap().isEmpty()) {
            return ResponseEntity.badRequest().body("Cannot dispatch. Queue empty or no riders available.");
        }

        // Pull from the exact same queue that OrderController just added to!
        Order nextOrder = deliveryService.getOrderQueue().dequeue();
        User bestRider = deliveryService.getRiderHeap().extractBestRider();

        nextOrder.status = "DISPATCHED";
        nextOrder.assignedRiderId = bestRider.getUserId(); 
        
        return ResponseEntity.ok("Success! Order assigned to nearest rider.");
    }
}