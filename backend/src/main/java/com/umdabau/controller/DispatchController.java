package com.umdabau.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
    origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class DispatchController {

    @Autowired
    private DeliveryService deliveryService; // <-- Shared brain!

    @PostMapping("/rider/clock-in")
    public ResponseEntity<String> clockInRider(@RequestBody User rider, @RequestParam double distanceToRestaurant) {
        deliveryService.clockInRider(rider, distanceToRestaurant);
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

    @PostMapping("/riders/spawn")
    public ResponseEntity<Map<String, Object>> spawnSimulationRiders(@RequestBody SpawnRiderRequest request) {
        String nodeId = request != null ? request.nodeId : null;
        int count = request != null ? request.count : 1;
        List<User> spawnedRiders = deliveryService.spawnSimulationRiders(nodeId, count);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", spawnedRiders.size() + " simulation rider(s) spawned.");
        response.put("spawnedCount", spawnedRiders.size());
        response.put("spawnNodeId", spawnedRiders.isEmpty() ? nodeId : spawnedRiders.get(0).getCurrentNodeId());
        response.put("availableRiders", deliveryService.getRiderHeap().getSize());
        response.put("riders", spawnedRiders);

        return ResponseEntity.ok(response);
    }

    public static class SpawnRiderRequest {
        public String nodeId;
        public int count;
    }
}
