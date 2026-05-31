package com.umdabau.controller;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.config.DummyDataLoader;
import com.umdabau.models.MenuItem;
import com.umdabau.models.Order;
import com.umdabau.models.Restaurant;
import com.umdabau.models.RouteSummary;
import com.umdabau.models.User;

@RestController
@RequestMapping("/api/live")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class OperationsController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/admin/overview")
    public Map<String, Object> getAdminOverview() {
        List<Order> queuedOrders = deliveryService.getOrderQueue().toList();
        List<User> users = deliveryService.getUsers().toList();
        List<Restaurant> restaurants = deliveryService.getRestaurants().toList();
        RouteSummary route = deliveryService.getLatestRouteSummary();

        List<Map<String, Object>> stats = new ArrayList<>();
        stats.add(stat("Total Users", users.size(), "Customers, riders, admins", "group"));
        stats.add(stat("Active Restaurants", restaurants.stream().filter((restaurant) -> "Open".equalsIgnoreCase(restaurant.getStatus())).count(), "Open for ordering", "storefront"));
        stats.add(stat("Queued Orders", deliveryService.getOrderQueue().getSize(), "Waiting for dispatch", "receipt_long"));
        stats.add(stat("Available Riders", deliveryService.getRiderHeap().getSize(), "In RiderHeap", "two_wheeler"));

        List<Map<String, String>> alerts = new ArrayList<>();
        if (queuedOrders.isEmpty()) {
            alerts.add(alert("Queue clear", "No order is waiting in OrderQueue.", "info"));
        } else {
            alerts.add(alert("Dispatch needed", queuedOrders.size() + " order(s) waiting for rider assignment.", "warning"));
        }
        if (route != null) {
            alerts.add(alert("Latest route ready", route.getAssignedRiderId() + " has an active calculated route.", "info"));
        }
        if (deliveryService.getRiderHeap().isEmpty()) {
            alerts.add(alert("No available riders", "RiderHeap is empty. Clock in a rider before assigning orders.", "danger"));
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("stats", stats);
        payload.put("alerts", alerts);
        payload.put("latestOrders", toOrderRows(queuedOrders));
        payload.put("latestRoute", route);
        return payload;
    }

    @GetMapping("/orders")
    public Map<String, Object> getOrders() {
        List<Order> queuedOrders = deliveryService.getOrderQueue().toList();
        List<Map<String, Object>> metrics = new ArrayList<>();
        metrics.add(stat("Active Orders", queuedOrders.size(), "in queue", "receipt_long"));
        metrics.add(stat("Pending Assignment", queuedOrders.size(), "requires rider", "assignment_late"));
        metrics.add(stat("Avg Delivery Time", latestEta(), "mins", "schedule"));
        metrics.add(stat("Available Riders", deliveryService.getRiderHeap().getSize(), "on standby", "delivery_dining"));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("metrics", metrics);
        payload.put("orders", toOrderRows(queuedOrders));
        payload.put("latestRoute", deliveryService.getLatestRouteSummary());
        return payload;
    }

    @GetMapping("/customer/home")
    public Map<String, Object> getCustomerHome() {
        List<MenuItem> menu = DummyDataLoader.populateMenu().inOrderTraversal();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("customerName", "Aina Rahman");
        payload.put("deliveryAddress", "KK12 Block A");
        payload.put("deliveryNodeId", "NODE_KK12_BLOCK_A");
        payload.put("restaurants", deliveryService.getRestaurants().toList());
        payload.put("recommendedItems", menu.stream().limit(6).toList());
        payload.put("categories", menu.stream().map(MenuItem::getCategory).distinct().toList());
        payload.put("activeOrder", toActiveOrder());
        payload.put("latestRoute", deliveryService.getLatestRouteSummary());
        payload.put("deliveryFee", 2.5);
        payload.put("platformFee", 0.8);
        return payload;
    }

    @GetMapping("/customer/tracking")
    public Map<String, Object> getCustomerTracking() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("order", toActiveOrder());
        payload.put("route", deliveryService.getLatestRouteSummary());
        payload.put("items", deliveryService.getLatestDispatchedOrder() == null ? List.of() : deliveryService.getLatestDispatchedOrder().cart);
        payload.put("deliveryFee", 2.5);
        payload.put("platformFee", 0.8);
        return payload;
    }

    @GetMapping("/rider/summary")
    public Map<String, Object> getRiderSummary() {
        RouteSummary route = deliveryService.getLatestRouteSummary();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("availableRiders", deliveryService.getRiderHeap().getSize());
        payload.put("currentNode", "NODE_FSKTM");
        payload.put("activeZones", List.of("NODE_FSKTM", "NODE_LIBRARY", "NODE_UM_CENTRAL"));
        payload.put("earnings", route == null ? 0.0 : Math.max(4.5, route.getTotalDistanceKm() * 2.0));
        payload.put("assignedOrder", toActiveOrder());
        payload.put("latestRoute", route);
        return payload;
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return deliveryService.getUsers().toList();
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        boolean added = deliveryService.getUsers().addUser(user);
        if (!added) {
            deliveryService.getUsers().updateUser(user);
        }
        if ("Rider".equalsIgnoreCase(user.getRole()) && user.isAvailable()) {
            deliveryService.getRiderHeap().insert(user, 1.0);
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User user) {
        user.setUserId(userId);
        if (!deliveryService.getUsers().updateUser(user)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        if (!deliveryService.getUsers().deleteUser(userId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/restaurants")
    public List<Restaurant> getRestaurants() {
        return deliveryService.getRestaurants().toList();
    }

    @PostMapping("/restaurants")
    public ResponseEntity<Restaurant> addRestaurant(@RequestBody Restaurant restaurant) {
        boolean added = deliveryService.getRestaurants().addRestaurant(restaurant);
        if (!added) {
            deliveryService.getRestaurants().updateRestaurant(restaurant);
        }
        return ResponseEntity.ok(restaurant);
    }

    @PutMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable String restaurantId, @RequestBody Restaurant restaurant) {
        restaurant.setRestaurantId(restaurantId);
        if (!deliveryService.getRestaurants().updateRestaurant(restaurant)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(restaurant);
    }

    @DeleteMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable String restaurantId) {
        if (!deliveryService.getRestaurants().deleteRestaurant(restaurantId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/locations")
    public List<Map<String, Object>> getLocations() {
        return List.of(
            location("NODE_FSKTM", "Faculty of Computer Science and IT", 3.1278141116117237, 101.6502887915006),
            location("NODE_LIBRARY", "UM Central Library", 3.120295528212342, 101.65459540772146),
            location("NODE_UM_CENTRAL", "UM Central", 3.120983186798967, 101.65350583982082),
            location("NODE_FOODY_AVENUE_HESHE12", "Foody Avenue KK12", 3.1258258595003636, 101.66148534130396),
            location("NODE_ENGINEERING", "Engineering Quad", 3.118893241995705, 101.655915371057),
            location("NODE_ZUS", "ZUS Coffee", 3.120509846723895, 101.65459257602762),
            location("NODE_KK12_BLOCK_A", "KK12 Block A", 3.1265502054052776, 101.66117198357561)
        );
    }

    private Map<String, Object> stat(String label, Object value, String detail, String icon) {
        Map<String, Object> stat = new LinkedHashMap<>();
        stat.put("label", label);
        stat.put("value", value);
        stat.put("detail", detail);
        stat.put("change", detail);
        stat.put("icon", icon);
        return stat;
    }

    private Map<String, String> alert(String title, String body, String level) {
        Map<String, String> alert = new LinkedHashMap<>();
        alert.put("title", title);
        alert.put("body", body);
        alert.put("level", level);
        return alert;
    }

    private Map<String, Object> location(String id, String name, double latitude, double longitude) {
        Map<String, Object> location = new LinkedHashMap<>();
        location.put("id", id);
        location.put("nodeId", id);
        location.put("name", name);
        location.put("latitude", latitude);
        location.put("longitude", longitude);
        return location;
    }

    private List<Map<String, Object>> toOrderRows(List<Order> orders) {
        return orders.stream().map((order) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", order.orderId);
            row.put("customer", order.customerId == null ? "Current customer" : order.customerId);
            row.put("vendor", order.restaurantId == null ? "Mixed restaurants" : order.restaurantId);
            row.put("rider", order.assignedRiderId == null ? "Assign Rider" : order.assignedRiderId);
            row.put("status", order.status);
            row.put("total", order.totalPrice);
            row.put("pickup", order.restaurantId == null ? "Restaurant" : order.restaurantId);
            row.put("dropoff", order.deliveryNodeId == null ? "NODE_KK12_BLOCK_A" : order.deliveryNodeId);
            row.put("eta", latestEta());
            row.put("time", order.timestamp);
            return row;
        }).toList();
    }

    private Map<String, Object> toActiveOrder() {
        Order order = deliveryService.getLatestDispatchedOrder();
        RouteSummary route = deliveryService.getLatestRouteSummary();
        Map<String, Object> activeOrder = new LinkedHashMap<>();
        activeOrder.put("id", order == null ? "No dispatched order" : order.orderId);
        activeOrder.put("vendor", order == null ? "Awaiting dispatch" : order.restaurantId);
        activeOrder.put("destination", order == null ? "No active destination" : order.deliveryNodeId);
        activeOrder.put("rider", route == null ? "Unassigned" : route.getAssignedRiderId());
        activeOrder.put("status", order == null ? "No Active Delivery" : order.status);
        activeOrder.put("eta", latestEta());
        activeOrder.put("total", order == null ? 0.0 : order.totalPrice);
        return activeOrder;
    }

    private String latestEta() {
        RouteSummary route = deliveryService.getLatestRouteSummary();
        if (route == null) {
            return "0";
        }
        return String.valueOf(Math.ceil(route.getEstimatedTimeMinutes()));
    }
}
