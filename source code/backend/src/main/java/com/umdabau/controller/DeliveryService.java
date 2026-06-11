package com.umdabau.controller;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import com.umdabau.data_structures.OrderQueue;
import com.umdabau.data_structures.RestaurantList;
import com.umdabau.data_structures.RiderHeap;
import com.umdabau.data_structures.UMGraph;
import com.umdabau.data_structures.UserList;
import com.umdabau.models.ActiveOrderRecord;
import com.umdabau.models.MenuItem;
import com.umdabau.models.Order;
import com.umdabau.models.Restaurant;
import com.umdabau.models.RouteSummary;
import com.umdabau.models.User;
import com.umdabau.models.GraphNode;
import com.umdabau.repository.ActiveOrderRepository;
import com.umdabau.repository.RestaurantRepository;
import com.umdabau.repository.UserRepository;

/**
 * Central runtime service for the delivery flow.
 * The database stores records, while these custom structures handle assignment and routing logic.
 */
@Service
public class DeliveryService {
    private static final String DEFAULT_RIDER_NODE_ID = "NODE_FSKTM";
    private static final String DEFAULT_RESTAURANT_NODE_ID = "NODE_UM_CENTRAL";
    private static final String DEFAULT_DELIVERY_NODE_ID = "NODE_KK12_BLOCK_A";
    private static final double BASE_DELIVERY_FEE = 1.20;
    private static final double DELIVERY_FEE_PER_KM = 1.10;
    private static final double MIN_DELIVERY_FEE = 1.50;
    private static final double BASE_PLATFORM_FEE = 0.20;
    private static final double PLATFORM_FEE_PER_KM = 0.25;
    private static final double MIN_PLATFORM_FEE = 0.30;
    
    // Shared in-memory structures used by the assignment logic after DB records are loaded.
    private final OrderQueue globalOrderQueue = new OrderQueue();
    private final RiderHeap globalRiderHeap = new RiderHeap(100);
    private final UMGraph campusMap = new UMGraph(120);
    private final UserList users = new UserList();
    private final RestaurantList restaurants = new RestaurantList();
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final ActiveOrderRepository activeOrderRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private RouteSummary latestRouteSummary;
    private Order latestCustomerOrder;
    private Order latestDispatchedOrder;
    private User latestAssignedRider;
    private String latestPickupNodeId;
    private String latestDropoffNodeId;
    private int simulationRiderSequence = 1;

    public DeliveryService(UserRepository userRepository, RestaurantRepository restaurantRepository, ActiveOrderRepository activeOrderRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.activeOrderRepository = activeOrderRepository;
        campusMap.initializeCampusMap();
    }

    @EventListener(ApplicationReadyEvent.class)
    public synchronized void hydrateRuntimeData() {
        // Rebuild the runtime structures from H2 so restart/pull does not lose app state.
        users.clear();
        restaurants.clear();

        while (!globalRiderHeap.isEmpty()) {
            globalRiderHeap.pop();
        }

        while (!globalOrderQueue.isEmpty()) {
            globalOrderQueue.dequeue();
        }

        for (User user : userRepository.findAll()) {
            users.addUser(user);
            if (isAvailableRider(user)) {
                // Available riders enter the heap with a priority based on distance to a default pickup point.
                globalRiderHeap.insert(user, getDistanceToRestaurant(user, DEFAULT_RESTAURANT_NODE_ID));
            }
        }

        for (Restaurant restaurant : restaurantRepository.findAll()) {
            restaurants.addRestaurant(restaurant);
        }

        for (ActiveOrderRecord record : activeOrderRepository.findByActiveTrueAndStatusOrderByTimestampAsc("PENDING_DISPATCH")) {
            // Pending DB orders go back into FIFO order processing after restart.
            globalOrderQueue.enqueue(toOrder(record));
        }

        hydrateLatestActiveAssignment();
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

    public Order getLatestCustomerOrder() {
        return latestCustomerOrder;
    }

    public void setLatestCustomerOrder(Order latestCustomerOrder) {
        this.latestCustomerOrder = latestCustomerOrder;
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

        // Re-score riders against this restaurant before choosing the best one.
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
        userRepository.save(bestRider);

        String riderNode = getStartNode(bestRider);
        String customerNode = getCustomerNode(nextOrder);

        // Route is split into rider -> restaurant and restaurant -> customer, then joined.
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
        latestCustomerOrder = nextOrder;
        latestAssignedRider = bestRider;
        latestRouteSummary = routeSummary;
        latestPickupNodeId = restaurantNode;
        latestDropoffNodeId = customerNode;
        saveAssignedOrderRecord(nextOrder, bestRider, riderNode, restaurantNode, customerNode, routeSummary);

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
            // After delivery, the rider becomes available again at the customer drop-off node.
            rider.setAvailable(true);
            rider.setStatus("Active");
            rider.setCurrentNodeId(latestDropoffNodeId == null ? DEFAULT_DELIVERY_NODE_ID : latestDropoffNodeId);
            userRepository.save(rider);
            globalRiderHeap.insert(rider, 1.0);
        }

        activeOrderRepository.findById(completedOrder.orderId).ifPresent((record) -> {
            record.setStatus("DELIVERED");
            record.setActive(false);
            activeOrderRepository.save(record);
        });

        latestDispatchedOrder = null;
        latestCustomerOrder = null;
        latestAssignedRider = null;
        latestRouteSummary = null;
        latestPickupNodeId = null;
        latestDropoffNodeId = null;

        return completedOrder;
    }

    public User clockInRider(User rider, double distanceToRestaurant) {
        // Clock-in writes the rider to DB and also inserts them into the runtime heap.
        rider.setRole("Rider");
        rider.setStatus("Active");
        rider.setAvailable(true);
        rider.setCurrentNodeId(normalizeNodeId(rider.getCurrentNodeId(), DEFAULT_RIDER_NODE_ID));

        User savedRider = userRepository.save(rider);
        boolean updatedInMemory = users.updateUser(savedRider);
        if (!updatedInMemory) {
            users.addUser(savedRider);
        }
        globalRiderHeap.insert(savedRider, distanceToRestaurant);
        return savedRider;
    }

    private void hydrateLatestActiveAssignment() {
        // Restore the newest active assignment so tracking still works after backend restart.
        activeOrderRepository.findTopByActiveTrueOrderByTimestampDesc().ifPresent((record) -> {
            Order order = toOrder(record);
            latestCustomerOrder = order;
            latestPickupNodeId = record.getPickupNodeId();
            latestDropoffNodeId = record.getDropoffNodeId();

            if ("DISPATCHED".equalsIgnoreCase(record.getStatus()) && record.getAssignedRiderId() != null && !record.getAssignedRiderId().isBlank()) {
                latestDispatchedOrder = order;
                latestAssignedRider = userRepository.findById(record.getAssignedRiderId()).orElse(null);
                latestRouteSummary = buildRouteFromRecord(order, record, latestAssignedRider);
            }
        });
    }

    private void saveAssignedOrderRecord(Order order, User rider, String riderNode, String pickupNode, String dropoffNode, RouteSummary routeSummary) {
        ActiveOrderRecord record = activeOrderRepository.findById(order.orderId).orElseGet(ActiveOrderRecord::new);
        record.setOrderId(order.orderId);
        record.setCustomerId(order.customerId);
        record.setRestaurantId(order.restaurantId);
        record.setAssignedRiderId(rider.getUserId());
        record.setDeliveryNodeId(order.deliveryNodeId);
        record.setPickupNodeId(pickupNode);
        record.setDropoffNodeId(dropoffNode);
        record.setRiderNodeId(riderNode);
        record.setStatus(order.status);
        record.setTimestamp(order.timestamp);
        record.setSubtotal(order.totalPrice);
        record.setTotalDistanceKm(routeSummary.getTotalDistanceKm());
        record.setEstimatedTimeMinutes(routeSummary.getEstimatedTimeMinutes());
        record.setActive(true);
        activeOrderRepository.save(record);
    }

    private Order toOrder(ActiveOrderRecord record) {
        Order order = new Order();
        order.orderId = record.getOrderId();
        order.customerId = record.getCustomerId();
        order.restaurantId = record.getRestaurantId();
        order.assignedRiderId = record.getAssignedRiderId();
        order.deliveryNodeId = record.getDeliveryNodeId();
        order.status = record.getStatus();
        order.timestamp = record.getTimestamp();
        order.totalPrice = record.getSubtotal();
        order.cart = parseOrderItems(record.getItemsJson());
        return order;
    }

    private List<MenuItem> parseOrderItems(String itemsJson) {
        if (itemsJson == null || itemsJson.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(itemsJson, new TypeReference<List<MenuItem>>() {});
        } catch (Exception error) {
            return List.of();
        }
    }

    private RouteSummary buildRouteFromRecord(Order order, ActiveOrderRecord record, User rider) {
        if (order == null || rider == null) {
            return null;
        }

        String riderNode = normalizeNodeId(record.getRiderNodeId() == null || record.getRiderNodeId().isBlank()
            ? rider.getCurrentNodeId()
            : record.getRiderNodeId(), DEFAULT_RIDER_NODE_ID);
        String pickupNode = normalizeNodeId(record.getPickupNodeId(), DEFAULT_RESTAURANT_NODE_ID);
        String dropoffNode = normalizeNodeId(record.getDropoffNodeId(), DEFAULT_DELIVERY_NODE_ID);

        try {
            // Recalculate path from saved node IDs instead of storing a large route blob in the DB.
            RouteSummary riderToRestaurant = campusMap.runDijkstra(
                riderNode,
                pickupNode,
                order.orderId,
                rider.getUserId()
            );
            RouteSummary restaurantToCustomer = campusMap.runDijkstra(
                pickupNode,
                dropoffNode,
                order.orderId,
                rider.getUserId()
            );
            return combineRouteSummaries(riderToRestaurant, restaurantToCustomer);
        } catch (IllegalArgumentException error) {
            return null;
        }
    }

    private void reprioritizeRidersForRestaurant(String restaurantNode) {
        List<User> availableRiders = new ArrayList<>();

        // Empty and rebuild the heap so priority is based on the current restaurant.
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
        // Demo helper: creates temporary riders when the heap is empty during testing.
        int count = Math.max(1, Math.min(requestedCount, 25));
        String nodeId = normalizeNodeId(requestedNodeId, DEFAULT_RIDER_NODE_ID);
        List<User> spawnedRiders = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            int riderNumber = simulationRiderSequence++;
            String riderId = "SIM-RIDER-" + riderNumber;
            while (userRepository.existsById(riderId)) {
                riderNumber = simulationRiderSequence++;
                riderId = "SIM-RIDER-" + riderNumber;
            }

            User simulationRider = new User(
                riderId,
                "Simulation Rider " + riderNumber,
                "simulation.rider." + riderNumber + "@umdabau.local",
                "Rider",
                "Active",
                true,
                nodeId
            );

            User savedRider = userRepository.save(simulationRider);
            users.addUser(savedRider);
            globalRiderHeap.insert(savedRider, riderNumber);
            spawnedRiders.add(savedRider);
        }

        return spawnedRiders;
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
            Restaurant restaurant = restaurants.findRestaurantById(order.restaurantId);
            if (restaurant != null && restaurant.getNodeId() != null && !restaurant.getNodeId().isBlank()) {
                return normalizeNodeId(restaurant.getNodeId(), DEFAULT_RESTAURANT_NODE_ID);
            }

            return normalizeNodeId(order.restaurantId, DEFAULT_RESTAURANT_NODE_ID);
        }

        return DEFAULT_RESTAURANT_NODE_ID;
    }

    public String getRestaurantNodeForOrder(Order order) {
        return getRestaurantNode(order);
    }

    private String getCustomerNode(Order order) {
        if (order.deliveryNodeId != null && !order.deliveryNodeId.isBlank()) {
            return normalizeNodeId(order.deliveryNodeId, DEFAULT_DELIVERY_NODE_ID);
        }

        return DEFAULT_DELIVERY_NODE_ID;
    }

    private boolean isAvailableRider(User user) {
        return user != null && "Rider".equalsIgnoreCase(user.getRole()) && user.isAvailable();
    }

    public String getCustomerNodeForOrder(Order order) {
        return getCustomerNode(order);
    }

    public double calculateDeliveryDistanceKm(Order order) {
        if (order == null) {
            return 0.0;
        }

        String restaurantNode = getRestaurantNode(order);
        String customerNode = getCustomerNode(order);

        try {
            RouteSummary route = campusMap.runDijkstra(
                restaurantNode,
                customerNode,
                order.orderId == null ? "FEE_QUOTE" : order.orderId,
                order.assignedRiderId == null ? "" : order.assignedRiderId
            );
            return roundCurrency(route.getTotalDistanceKm());
        } catch (IllegalArgumentException error) {
            return 0.0;
        }
    }

    public double calculateDeliveryFee(double distanceKm) {
        return roundCurrency(Math.max(MIN_DELIVERY_FEE, BASE_DELIVERY_FEE + Math.max(distanceKm, 0.0) * DELIVERY_FEE_PER_KM));
    }

    public double calculatePlatformFee(double distanceKm) {
        return roundCurrency(Math.max(MIN_PLATFORM_FEE, BASE_PLATFORM_FEE + Math.max(distanceKm, 0.0) * PLATFORM_FEE_PER_KM));
    }

    private String normalizeNodeId(String nodeId, String fallbackNodeId) {
        if (nodeId == null || nodeId.isBlank()) {
            return fallbackNodeId;
        }

        // Accept older/simple IDs from seed data or UI and map them to graph node IDs.
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

    private double roundCurrency(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private RouteSummary combineRouteSummaries(RouteSummary firstRoute, RouteSummary secondRoute) {
        GraphNode[] firstPath = firstRoute.getPath();
        GraphNode[] secondPath = secondRoute.getPath();
        int secondPathStart = secondPath.length > 0 ? 1 : 0;
        GraphNode[] combinedPath = new GraphNode[firstPath.length + secondPath.length - secondPathStart];

        // Skip the first node of the second route so the pickup node is not duplicated.
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
