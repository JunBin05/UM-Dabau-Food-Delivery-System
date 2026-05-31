package com.umdabau.controller; // or package service; if you made a new folder

import java.util.ArrayList;
import java.util.List;

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
    private User latestAssignedRider;
    private String latestPickupNodeId;
    private String latestDropoffNodeId;
    private int simulationRiderSequence = 1;

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

    public User getLatestAssignedRider() {
        return latestAssignedRider;
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

        Order orderToAssign = globalOrderQueue.peek();
        String restaurantNode = getRestaurantNode(orderToAssign);

        ensureAvailableRider(restaurantNode);
        reprioritizeRidersForRestaurant(restaurantNode);

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
        latestAssignedRider = bestRider;
        latestRouteSummary = routeSummary;
        latestPickupNodeId = restaurantNode;
        latestDropoffNodeId = customerNode;

        return routeSummary;
    }

    public Order completeLatestDelivery() {
        if (latestDispatchedOrder == null) {
            return null;
        }

        Order completedOrder = latestDispatchedOrder;
        completedOrder.status = "DELIVERED";

        User rider = latestAssignedRider;
        if (rider == null && completedOrder.assignedRiderId != null) {
            rider = users.findUserById(completedOrder.assignedRiderId);
        }

        if (rider != null) {
            rider.setAvailable(true);
            rider.setStatus("Active");
            rider.setCurrentNodeId(latestDropoffNodeId == null ? DEFAULT_DELIVERY_NODE_ID : latestDropoffNodeId);
            globalRiderHeap.insert(rider, 1.0);
        }

        latestDispatchedOrder = null;
        latestAssignedRider = null;
        latestRouteSummary = null;
        latestPickupNodeId = null;
        latestDropoffNodeId = null;

        return completedOrder;
    }

    private void reprioritizeRidersForRestaurant(String restaurantNode) {
        List<User> availableRiders = new ArrayList<>();

        while (!globalRiderHeap.isEmpty()) {
            User rider = globalRiderHeap.pop();
            if (rider != null && rider.isAvailable()) {
                availableRiders.add(rider);
            }
        }

        for (User rider : availableRiders) {
            double distanceScore = getDistanceToRestaurant(rider, restaurantNode);
            globalRiderHeap.insert(rider, distanceScore);
        }
    }

    private double getDistanceToRestaurant(User rider, String restaurantNode) {
        try {
            RouteSummary route = campusMap.runDijkstra(
                getStartNode(rider),
                restaurantNode,
                "RIDER_PRIORITY",
                rider.getUserId()
            );

            return route.getTotalDistanceKm();
        } catch (IllegalArgumentException error) {
            return Double.MAX_VALUE;
        }
    }

    public List<User> spawnSimulationRiders(String requestedNodeId, int requestedCount) {
        int count = Math.max(1, Math.min(requestedCount, 25));
        String nodeId = normalizeNodeId(requestedNodeId, DEFAULT_RIDER_NODE_ID);
        List<User> spawnedRiders = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            int riderNumber = simulationRiderSequence++;
            User simulationRider = new User(
                "SIM-RIDER-" + riderNumber,
                "Simulation Rider " + riderNumber,
                "simulation.rider." + riderNumber + "@umdabau.local",
                "Rider",
                "Active",
                true,
                nodeId
            );

            users.addUser(simulationRider);
            globalRiderHeap.insert(simulationRider, riderNumber);
            spawnedRiders.add(simulationRider);
        }

        return spawnedRiders;
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
        restaurants.addRestaurant(new Restaurant("REST-001", "Cafe KK8", "Cafe", "Open", "Kinabalu Residential College", "NODE_CAFE_KK8"));
        restaurants.addRestaurant(new Restaurant("REST-002", "Cafe KK10", "Cafe", "Open", "Tun Ahmad Zaidi Residential College", "NODE_CAFE_KK10"));
        restaurants.addRestaurant(new Restaurant("REST-003", "Kafe Bahasa", "Malay", "Open", "Faculty of Languages and Linguistics", "NODE_KAFE_BAHASA"));
        restaurants.addRestaurant(new Restaurant("REST-004", "Bayu Cafe", "Malay", "Open", "Science Faculty", "NODE_BAYU_CAFE"));
        restaurants.addRestaurant(new Restaurant("REST-005", "Kafe Sains", "Vegetarian", "Open", "Science Faculty", "NODE_KAFE_SAINS"));
        restaurants.addRestaurant(new Restaurant("REST-006", "Yogo @ Universiti Malaya", "Snacks", "Open", "IPS / KK12 Route", "NODE_YOGO"));
        restaurants.addRestaurant(new Restaurant("REST-007", "Foody Avenue & He & She Coffee", "Malay Snacks", "Open", "KK12 Food Court", "NODE_FOODY_AVENUE_HESHE12"));
        restaurants.addRestaurant(new Restaurant("REST-008", "Novi Kafe", "Cafe", "Open", "KK12", "NODE_NOVI_KAFE"));
        restaurants.addRestaurant(new Restaurant("REST-009", "Warong Kaki Lima", "Malay", "Open", "KK5", "NODE_WARONG_LIMA"));
        restaurants.addRestaurant(new Restaurant("REST-010", "Q Bistro Universiti Malaya", "Mamak", "Open", "KL Gate", "NODE_Q_BISTRO"));
        restaurants.addRestaurant(new Restaurant("REST-011", "ASTAR Cafe", "Malay", "Open", "First College", "NODE_ASTAR_CAFE"));
        restaurants.addRestaurant(new Restaurant("REST-012", "Toast Kita Cafe", "Cafe", "Open", "KK6", "NODE_TOAST_KITA"));
        restaurants.addRestaurant(new Restaurant("REST-013", "MediCafe", "Healthy", "Open", "Faculty of Medicine", "NODE_MEDI_CAFE"));
        restaurants.addRestaurant(new Restaurant("REST-014", "Cafe KK2", "Cafe", "Open", "Tuanku Bahiyah Residential College", "NODE_CAFE_KK2"));
        restaurants.addRestaurant(new Restaurant("REST-015", "Engineering Fac Chicken Rice", "Chinese", "Open", "Engineering", "NODE_ENG_CHICKEN_RICE"));
        restaurants.addRestaurant(new Restaurant("REST-016", "KH Shawarma", "Middle Eastern", "Open", "Engineering", "NODE_KH_SHAWARMA"));
        restaurants.addRestaurant(new Restaurant("REST-017", "ZUS Coffee", "Drinks", "Open", "UM Central Library", "NODE_ZUS"));
        restaurants.addRestaurant(new Restaurant("REST-018", "UM Central & He & She Coffee", "Cafe", "Open", "UM Central", "NODE_UM_CENTRAL"));
        restaurants.addRestaurant(new Restaurant("REST-019", "POKOK KL Cafe", "Cafe", "Open", "Faculty of Business & Economics", "NODE_POKOK_CAFE"));
    }

    private void ensureAvailableRider(String fallbackNodeId) {
        if (!globalRiderHeap.isEmpty()) {
            return;
        }

        spawnSimulationRiders(fallbackNodeId, 1);
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
        if (nodeId == null || nodeId.isBlank()) {
            return fallbackNodeId;
        }

        String resolvedNodeId = switch (nodeId) {
            case "CENTRAL_EATERY" -> "NODE_UM_CENTRAL";
            case "ENGINEERING_QUAD" -> "NODE_ENGINEERING";
            case "LIBRARY" -> "NODE_LIBRARY";
            case "FSKTM_BLOCK_A" -> "NODE_FSKTM";
            case "KK12" -> "NODE_KK12_BLOCK_A";
            case "REST-001" -> "NODE_CAFE_KK8";
            case "REST-002" -> "NODE_CAFE_KK10";
            case "REST-003" -> "NODE_KAFE_BAHASA";
            case "REST-004" -> "NODE_BAYU_CAFE";
            case "REST-005" -> "NODE_KAFE_SAINS";
            case "REST-006" -> "NODE_YOGO";
            case "REST-007" -> "NODE_FOODY_AVENUE_HESHE12";
            case "REST-008" -> "NODE_NOVI_KAFE";
            case "REST-009" -> "NODE_WARONG_LIMA";
            case "REST-010" -> "NODE_Q_BISTRO";
            case "REST-011" -> "NODE_ASTAR_CAFE";
            case "REST-012" -> "NODE_TOAST_KITA";
            case "REST-013" -> "NODE_MEDI_CAFE";
            case "REST-014" -> "NODE_CAFE_KK2";
            case "REST-015" -> "NODE_ENG_CHICKEN_RICE";
            case "REST-016" -> "NODE_KH_SHAWARMA";
            case "REST-017" -> "NODE_ZUS";
            case "REST-018" -> "NODE_UM_CENTRAL";
            case "REST-019" -> "NODE_POKOK_CAFE";
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
