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

import com.umdabau.models.Order;
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

    private static final String DEFAULT_RIDER_NODE_ID = "NODE_FSKTM";
    private static final String DEFAULT_DELIVERY_NODE_ID = "NODE_KK12_BLOCK_A";

    @Autowired
    private DeliveryService deliveryService; // <-- Shared brain!

    @PostMapping("/rider/clock-in")
    public ResponseEntity<String> clockInRider(@RequestBody User rider, @RequestParam double distanceToRestaurant) {
        deliveryService.getRiderHeap().insert(rider, distanceToRestaurant);
        return ResponseEntity.ok("Rider added to dispatch pool.");
    }

    @PostMapping("/assign")
    public ResponseEntity<RouteSummary> assignNextOrder() {
        if (deliveryService.getOrderQueue().isEmpty() || deliveryService.getRiderHeap().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        // Pull from the exact same queue that OrderController just added to!
        Order nextOrder = deliveryService.getOrderQueue().dequeue();
        User bestRider = deliveryService.getRiderHeap().extractBestRider();

        nextOrder.status = "DISPATCHED";
        nextOrder.assignedRiderId = bestRider.getUserId();
        bestRider.setAvailable(false);
        bestRider.setStatus("ASSIGNED");

        String startNode = getStartNode(bestRider);
        String endNode = getEndNode(nextOrder);

        RouteSummary routeSummary;

        try {
            routeSummary = deliveryService.getCampusMap().runDijkstra(
                startNode,
                endNode,
                nextOrder.orderId,
                bestRider.getUserId()
            );
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok(routeSummary);
    }

    private String getStartNode(User rider) {
        if (rider.getCurrentNodeId() != null && !rider.getCurrentNodeId().isBlank()) {
            return normalizeNodeId(rider.getCurrentNodeId(), DEFAULT_RIDER_NODE_ID);
        }

        return DEFAULT_RIDER_NODE_ID;
    }

    private String getEndNode(Order order) {
        if (order.deliveryNodeId != null && !order.deliveryNodeId.isBlank()) {
            return normalizeNodeId(order.deliveryNodeId, DEFAULT_DELIVERY_NODE_ID);
        }

        return DEFAULT_DELIVERY_NODE_ID;
    }

    private String normalizeNodeId(String nodeId, String fallbackNodeId) {
        String resolvedNodeId = switch (nodeId) {
            case "CENTRAL_EATERY" -> "NODE_UM_CENTRAL";
            case "ENGINEERING_QUAD" -> "NODE_ENGINEERING";
            case "LIBRARY" -> "NODE_LIBRARY";
            case "FSKTM_BLOCK_A" -> "NODE_FSKTM";
            case "KK12" -> "NODE_KK12_BLOCK_A";
            case "REST-001" -> "NODE_UM_CENTRAL";
            case "REST-002" -> "NODE_FOODY_AVENUE_HESHE12";
            case "REST-003" -> "NODE_UM_CENTRAL";
            case "REST-004" -> "NODE_ENGINEERING";
            case "REST-005" -> "NODE_ZUS";
            case "REST-006" -> "NODE_LIBRARY";
            default -> nodeId;
        };

        if (deliveryService.getCampusMap().getNodeById(resolvedNodeId) != null) {
            return resolvedNodeId;
        }

        return fallbackNodeId;
    }
}
