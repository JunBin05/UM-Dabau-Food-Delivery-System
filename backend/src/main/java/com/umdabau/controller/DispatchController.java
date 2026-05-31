package com.umdabau.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.models.RouteSummary;
import com.umdabau.models.User;

@RestController
@RequestMapping("/api/dispatch")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class DispatchController {

    @Autowired
    private DeliveryService deliveryService; // <-- Shared brain!

    @PostMapping("/rider/clock-in")
    public ResponseEntity<String> clockInRider(@RequestBody User rider, @RequestParam double distanceToRestaurant) {
        deliveryService.getRiderHeap().insert(rider, distanceToRestaurant);
        return ResponseEntity.ok("Rider added to dispatch pool.");
    }

    @PostMapping("/assign")
    public ResponseEntity<RouteSummary> assignNextOrder() {
        try {
            RouteSummary routeSummary = deliveryService.assignNextOrder();
            if (routeSummary == null) {
                return ResponseEntity.badRequest().body(null);
            }
            return ResponseEntity.ok(routeSummary);
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
