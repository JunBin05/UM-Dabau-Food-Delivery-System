package com.umdabau.controller; // or package service; if you made a new folder

import org.springframework.stereotype.Service;

import com.umdabau.data_structures.OrderQueue;
import com.umdabau.data_structures.RestaurantList;
import com.umdabau.data_structures.RiderHeap;
import com.umdabau.data_structures.UMGraph;
import com.umdabau.data_structures.UserList;
import com.umdabau.models.Order;
import com.umdabau.models.Restaurant;
import com.umdabau.models.RouteSummary;
import com.umdabau.models.User;
import com.umdabau.models.GraphNode;

@Service // <-- This tells Spring Boot to create EXACTLY ONE instance of this class to share!
public class DeliveryService {
    private static final String DEFAULT_RIDER_NODE_ID = "NODE_FSKTM";
    private static final String DEFAULT_RESTAURANT_NODE_ID = "NODE_UM_CENTRAL";
    private static final String DEFAULT_DELIVERY_NODE_ID = "NODE_KK12_BLOCK_A";
    
    // The shared brain for the whole app
    private final OrderQueue globalOrderQueue = new OrderQueue();
    private final RiderHeap globalRiderHeap = new RiderHeap(100);
    private final UMGraph campusMap = new UMGraph(120);
    private final UserList users = new UserList();
    private final RestaurantList restaurants = new RestaurantList();
    private RouteSummary latestRouteSummary;
    private Order latestDispatchedOrder;
    private String latestPickupNodeId;
    private String latestDropoffNodeId;

    public DeliveryService() {
        campusMap.initializeCampusMap();
        seedUsers();
        seedRestaurants();
    }

    public OrderQueue getOrderQueue() {
        return globalOrderQueue;
    }

    public RiderHeap getRiderHeap() {
        return globalRiderHeap;
    }

    public UMGraph getCampusMap() {
        return campusMap;
    }

    public UserList getUsers() {
        return users;
    }

    public RestaurantList getRestaurants() {
        return restaurants;
    }

    public RouteSummary getLatestRouteSummary() {
        return latestRouteSummary;
    }

    public void setLatestRouteSummary(RouteSummary latestRouteSummary) {
        this.latestRouteSummary = latestRouteSummary;
    }

    public Order getLatestDispatchedOrder() {
        return latestDispatchedOrder;
    }

    public void setLatestDispatchedOrder(Order latestDispatchedOrder) {
        this.latestDispatchedOrder = latestDispatchedOrder;
    }

    public String getLatestPickupNodeId() {
        return latestPickupNodeId;
    }

    public String getLatestDropoffNodeId() {
        return latestDropoffNodeId;
    }

    public RouteSummary assignNextOrder() {
        if (globalOrderQueue.isEmpty()) {
            return null;
        }

        ensureAvailableRider();

        if (globalRiderHeap.isEmpty()) {
            return null;
        }

        Order nextOrder = globalOrderQueue.dequeue();
        User bestRider = globalRiderHeap.pop();

        nextOrder.status = "DISPATCHED";
        nextOrder.assignedRiderId = bestRider.getUserId();
        bestRider.setAvailable(false);
        bestRider.setStatus("ASSIGNED");

        String riderNode = getStartNode(bestRider);
        String restaurantNode = getRestaurantNode(nextOrder);
        String customerNode = getCustomerNode(nextOrder);

        RouteSummary riderToRestaurant = campusMap.runDijkstra(
            riderNode,
            restaurantNode,
            nextOrder.orderId,
            bestRider.getUserId()
        );
        RouteSummary restaurantToCustomer = campusMap.runDijkstra(
            restaurantNode,
            customerNode,
            nextOrder.orderId,
            bestRider.getUserId()
        );
        RouteSummary routeSummary = combineRouteSummaries(riderToRestaurant, restaurantToCustomer);

        latestDispatchedOrder = nextOrder;
        latestRouteSummary = routeSummary;
        latestPickupNodeId = restaurantNode;
        latestDropoffNodeId = customerNode;

        return routeSummary;
    }

    private void seedUsers() {
        users.addUser(new User("USR-001", "Aina Rahman", "aina.rahman@student.um.edu.my", "Customer", "Active", false, ""));
        users.addUser(new User("USR-002", "Rafiq Lim", "rafiq.lim@rider.umdabau.local", "Rider", "Active", true, "NODE_FSKTM"));
        users.addUser(new User("USR-003", "Mei Yee", "mei.yee@rider.umdabau.local", "Rider", "Active", true, "NODE_LIBRARY"));
        users.addUser(new User("USR-004", "Vincent Admin", "vincent.admin@umdabau.local", "Admin", "Active", false, ""));
        users.addUser(new User("USR-005", "Amir Hakim", "amir.hakim@rider.umdabau.local", "Rider", "Active", true, "NODE_ENGINEERING"));
        users.addUser(new User("USR-006", "Nur Iman", "nur.iman@rider.umdabau.local", "Rider", "Active", true, "NODE_ZUS"));

        globalRiderHeap.insert(users.findUserById("USR-002"), 1.0);
        globalRiderHeap.insert(users.findUserById("USR-003"), 2.0);
        globalRiderHeap.insert(users.findUserById("USR-005"), 3.0);
        globalRiderHeap.insert(users.findUserById("USR-006"), 4.0);
    }

    private void seedRestaurants() {
        restaurants.addRestaurant(new Restaurant("REST-001", "Campus Cafe", "Malay & Chinese", "Open", "UM Central", "NODE_UM_CENTRAL"));
        restaurants.addRestaurant(new Restaurant("REST-002", "KK12 Quick Bites", "Malay Snacks", "Open", "KK12 Food Court", "NODE_FOODY_AVENUE_HESHE12"));
        restaurants.addRestaurant(new Restaurant("REST-003", "Central Eatery Malay Corner", "Malay", "Open", "UM Central", "NODE_UM_CENTRAL"));
        restaurants.addRestaurant(new Restaurant("REST-004", "Engineering Bites", "Western", "Open", "Engineering Quad", "NODE_ENGINEERING"));
        restaurants.addRestaurant(new Restaurant("REST-005", "Dabau Drinks Lab", "Drinks", "Open", "Library", "NODE_ZUS"));
        restaurants.addRestaurant(new Restaurant("REST-006", "Library Greens", "Vegetarian", "Closed", "Library", "NODE_LIBRARY"));
    }

    private void ensureAvailableRider() {
        if (!globalRiderHeap.isEmpty()) {
            return;
        }

        User simulationRider = new User(
            "SIM-RIDER-" + System.currentTimeMillis(),
            "Simulation Rider",
            "simulation.rider@umdabau.local",
            "Rider",
            "Active",
            true,
            DEFAULT_RIDER_NODE_ID
        );
        users.addUser(simulationRider);
        globalRiderHeap.insert(simulationRider, 1.0);
    }

    private String getStartNode(User rider) {
        if (rider.getCurrentNodeId() != null && !rider.getCurrentNodeId().isBlank()) {
            return normalizeNodeId(rider.getCurrentNodeId(), DEFAULT_RIDER_NODE_ID);
        }

        return DEFAULT_RIDER_NODE_ID;
    }

    private String getRestaurantNode(Order order) {
        if (order.restaurantId != null && !order.restaurantId.isBlank()) {
            return normalizeNodeId(order.restaurantId, DEFAULT_RESTAURANT_NODE_ID);
        }

        return DEFAULT_RESTAURANT_NODE_ID;
    }

    private String getCustomerNode(Order order) {
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

        if (campusMap.getNodeById(resolvedNodeId) != null) {
            return resolvedNodeId;
        }

        return fallbackNodeId;
    }

    private RouteSummary combineRouteSummaries(RouteSummary firstRoute, RouteSummary secondRoute) {
        GraphNode[] firstPath = firstRoute.getPath();
        GraphNode[] secondPath = secondRoute.getPath();
        int secondPathStart = secondPath.length > 0 ? 1 : 0;
        GraphNode[] combinedPath = new GraphNode[firstPath.length + secondPath.length - secondPathStart];

        for (int i = 0; i < firstPath.length; i++) {
            combinedPath[i] = firstPath[i];
        }

        for (int i = secondPathStart; i < secondPath.length; i++) {
            combinedPath[firstPath.length + i - secondPathStart] = secondPath[i];
        }

        return new RouteSummary(
            firstRoute.getOrderId(),
            firstRoute.getAssignedRiderId(),
            combinedPath,
            firstRoute.getTotalDistanceKm() + secondRoute.getTotalDistanceKm(),
            firstRoute.getEstimatedTimeMinutes() + secondRoute.getEstimatedTimeMinutes()
        );
    }
}
