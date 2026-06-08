package com.umdabau.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import com.umdabau.data_structures.MenuBST;
import com.umdabau.data_structures.UserHashMap;
import com.umdabau.models.ActiveOrderRecord;
import com.umdabau.models.GraphNode;
import com.umdabau.models.MenuItem;
import com.umdabau.models.Order;
import com.umdabau.models.Restaurant;
import com.umdabau.models.RouteSummary;
import com.umdabau.models.User;
import com.umdabau.repository.ActiveOrderRepository;
import com.umdabau.repository.MenuItemRepository;
import com.umdabau.repository.RestaurantRepository;
import com.umdabau.repository.UserRepository;

@RestController
@RequestMapping("/api/live")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class OperationsController {
    private static final String DEFAULT_CUSTOMER_ID = "USR-001";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ActiveOrderRepository activeOrderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @GetMapping("/admin/overview")
    public Map<String, Object> getAdminOverview() {
        List<Order> activeOrders = getActiveOrdersForMonitoring();
        List<User> users = userRepository.findAll();
        List<Restaurant> restaurants = restaurantRepository.findAll();
        RouteSummary route = getDbBackedLatestRoute();

        List<Map<String, Object>> stats = new ArrayList<>();
        stats.add(stat("Total Users", users.size(), "Customers, riders, admins", "group"));
        stats.add(stat("Active Restaurants", restaurants.stream().filter((restaurant) -> "Open".equalsIgnoreCase(restaurant.getStatus())).count(), "Open for ordering", "storefront"));
        stats.add(stat("Queued Orders", activeOrders.stream().filter((order) -> "PENDING_DISPATCH".equalsIgnoreCase(order.status)).count(), "Waiting for dispatch", "receipt_long"));
        stats.add(stat("Available Riders", deliveryService.getRiderHeap().getSize(), "In RiderHeap", "two_wheeler"));

        List<Map<String, String>> alerts = new ArrayList<>();
        if (activeOrders.isEmpty()) {
            alerts.add(alert("Queue clear", "No order is waiting in OrderQueue.", "info"));
        } else {
            alerts.add(alert("Dispatch needed", activeOrders.size() + " active order(s) in monitoring.", "warning"));
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
        payload.put("latestOrders", toOrderRows(activeOrders));
        payload.put("latestRoute", route);
        payload.put("activeRiders", toActiveRiderRows());
        payload.put("pickupNodeId", deliveryService.getLatestPickupNodeId());
        payload.put("dropoffNodeId", deliveryService.getLatestDropoffNodeId());
        return payload;
    }

    @GetMapping("/orders")
    public Map<String, Object> getOrders() {
        List<Order> activeOrders = getActiveOrdersForMonitoring();
        long pendingCount = activeOrders.stream().filter((order) -> "PENDING_DISPATCH".equalsIgnoreCase(order.status)).count();
        List<Map<String, Object>> metrics = new ArrayList<>();
        metrics.add(stat("Active Orders", activeOrders.size(), "DB-backed active records", "receipt_long"));
        metrics.add(stat("Pending Assignment", pendingCount, "requires rider", "assignment_late"));
        metrics.add(stat("Avg Delivery Time", latestEta(), "mins", "schedule"));
        metrics.add(stat("Available Riders", deliveryService.getRiderHeap().getSize(), "on standby", "delivery_dining"));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("metrics", metrics);
        payload.put("orders", toOrderRows(activeOrders));
        payload.put("latestRoute", getDbBackedLatestRoute());
        payload.put("pickupNodeId", deliveryService.getLatestPickupNodeId());
        payload.put("dropoffNodeId", deliveryService.getLatestDropoffNodeId());
        return payload;
    }

    @GetMapping("/customer/home")
    public Map<String, Object> getCustomerHome() {
        List<MenuItem> menu = getMenuItemsFromDatabase();
        User customer = userRepository.findById(DEFAULT_CUSTOMER_ID).orElse(null);
        String deliveryNodeId = resolveCustomerDeliveryNodeId(customer);
        Map<String, Object> deliveryLocation = graphLocation(deliveryNodeId);
        Map<String, Object> feeQuote = quoteFees(menu.isEmpty() ? "" : menu.get(0).getRestaurantId(), deliveryNodeId);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("customerName", customer == null ? "Customer" : customer.getFullName());
        payload.put("deliveryAddress", deliveryLocation.get("name"));
        payload.put("deliveryNodeId", deliveryNodeId);
        payload.put("restaurants", restaurantRepository.findAll());
        payload.put("recommendedItems", menu.stream().limit(6).toList());
        payload.put("categories", menu.stream().map(MenuItem::getCategory).distinct().toList());
        payload.put("activeOrder", toActiveOrder());
        payload.put("latestRoute", deliveryService.getLatestRouteSummary());
        payload.put("distanceKm", feeQuote.get("distanceKm"));
        payload.put("deliveryFee", feeQuote.get("deliveryFee"));
        payload.put("platformFee", feeQuote.get("platformFee"));
        return payload;
    }

    @PutMapping("/customer/location")
    public ResponseEntity<Map<String, Object>> updateCustomerLocation(@RequestBody Map<String, String> request) {
        String requestedNodeId = request.getOrDefault("deliveryNodeId", request.get("nodeId"));
        String deliveryNodeId = normalizeKnownNodeId(requestedNodeId, "");

        if (!hasText(deliveryNodeId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unknown delivery location."));
        }

        User customer = userRepository.findById(DEFAULT_CUSTOMER_ID).orElseGet(() ->
            new User(DEFAULT_CUSTOMER_ID, "Aina Rahman", "aina.rahman@student.um.edu.my", "Customer", "Active", false, deliveryNodeId)
        );

        customer.setCurrentNodeId(deliveryNodeId);
        userRepository.save(customer);
        deliveryService.hydrateRuntimeData();

        Map<String, Object> location = graphLocation(deliveryNodeId);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", "Delivery location saved.");
        payload.put("deliveryNodeId", deliveryNodeId);
        payload.put("deliveryAddress", location.get("name"));
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/customer/tracking")
    public Map<String, Object> getCustomerTracking() {
        Order activeOrder = deliveryService.getLatestCustomerOrder();
        ActiveOrderRecord activeRecord = findActiveOrderRecord(activeOrder);
        if (activeOrder == null && activeRecord != null) {
            activeOrder = toOrder(activeRecord);
        }

        User rider = deliveryService.getLatestAssignedRider();
        if (rider == null && activeOrder != null && activeOrder.assignedRiderId != null && !activeOrder.assignedRiderId.isBlank()) {
            rider = userRepository.findById(activeOrder.assignedRiderId).orElse(null);
        }
        String pickupNodeId = resolvePickupNodeId(activeOrder, activeRecord);
        String dropoffNodeId = resolveDropoffNodeId(activeOrder, activeRecord);
        RouteSummary currentRoute = deliveryService.getLatestRouteSummary();
        RouteSummary route = activeOrder != null && currentRoute != null && activeOrder.orderId.equals(currentRoute.getOrderId())
            ? currentRoute
            : buildRouteFromActiveRecord(activeOrder, activeRecord, rider, pickupNodeId, dropoffNodeId);
        Restaurant restaurant = activeOrder == null || activeOrder.restaurantId == null
            ? null
            : restaurantRepository.findById(activeOrder.restaurantId).orElse(null);
        String restaurantName = restaurant == null
            ? activeOrder == null ? "" : activeOrder.restaurantId
            : restaurant.getRestaurantName();
        List<MenuItem> items = activeOrder == null || activeOrder.cart == null ? List.of() : activeOrder.cart;
        double subtotal = activeRecord == null ? items.stream().mapToDouble(MenuItem::getPrice).sum() : activeRecord.getSubtotal();
        Map<String, Object> fallbackFeeQuote = activeOrder == null
            ? Map.of("deliveryFee", 0.0, "platformFee", 0.0)
            : quoteFees(activeOrder.restaurantId, activeOrder.deliveryNodeId);
        double deliveryFee = activeRecord == null ? (double) fallbackFeeQuote.get("deliveryFee") : activeRecord.getDeliveryFee();
        double platformFee = activeRecord == null ? (double) fallbackFeeQuote.get("platformFee") : activeRecord.getPlatformFee();
        double total = activeRecord == null ? subtotal + deliveryFee + platformFee : activeRecord.getTotal();
        Map<String, Object> pickupLocation = graphLocation(pickupNodeId);
        Map<String, Object> dropoffLocation = graphLocation(dropoffNodeId);
        Map<String, Object> riderLocation = graphLocation(resolveRiderNodeId(activeRecord, rider, pickupNodeId));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("hasActiveOrder", activeOrder != null);
        payload.put("active", activeOrder != null);
        payload.put("orderId", activeOrder == null ? "" : activeOrder.orderId);
        payload.put("orderStatus", activeOrder == null ? "NO_ACTIVE_ORDER" : activeOrder.status);
        payload.put("status", activeOrder == null ? "NO_ACTIVE_ORDER" : activeOrder.status);
        payload.put("restaurantName", restaurantName);
        payload.put("restaurantId", activeOrder == null ? "" : activeOrder.restaurantId);
        payload.put("restaurantNode", pickupLocation);
        payload.put("riderName", rider == null ? "Waiting for rider assignment" : rider.getFullName());
        payload.put("riderId", rider == null ? "" : rider.getUserId());
        payload.put("riderNode", riderLocation);
        payload.put("customerNode", dropoffLocation);
        payload.put("eta", route == null ? 0 : Math.ceil(route.getEstimatedTimeMinutes()));
        payload.put("etaMinutes", route == null ? 0 : Math.ceil(route.getEstimatedTimeMinutes()));
        payload.put("distanceKm", route == null ? 0 : route.getTotalDistanceKm());
        payload.put("route", route);
        payload.put("routePath", route == null ? List.of() : Arrays.asList(route.getPath()));
        payload.put("routeNodes", route == null ? List.of() : Arrays.asList(route.getPath()));
        payload.put("items", items);
        payload.put("orderItems", items);
        payload.put("subtotal", subtotal);
        payload.put("deliveryFee", deliveryFee);
        payload.put("platformFee", platformFee);
        payload.put("tax", platformFee);
        payload.put("total", total);
        payload.put("pickupNodeId", pickupNodeId);
        payload.put("pickupLocation", pickupLocation);
        payload.put("dropoffNodeId", dropoffNodeId);
        payload.put("dropoffLocation", dropoffLocation);
        payload.put("locations", activeOrder == null ? getLocations() : List.of());
        payload.put("order", toTrackingOrder(activeOrder, route, restaurant, rider, dropoffNodeId, total));
        return payload;
    }

    @GetMapping("/rider/summary")
    public Map<String, Object> getRiderSummary() {
        ActiveOrderRecord activeRecord = findActiveOrderRecord(deliveryService.getLatestDispatchedOrder());
        Order activeOrder = deliveryService.getLatestDispatchedOrder();
        if (activeOrder == null && activeRecord != null) {
            activeOrder = toOrder(activeRecord);
        }

        User rider = findAssignedRider(activeOrder);
        String pickupNodeId = resolvePickupNodeId(activeOrder, activeRecord);
        String dropoffNodeId = resolveDropoffNodeId(activeOrder, activeRecord);
        RouteSummary route = deliveryService.getLatestRouteSummary();
        if (route == null) {
            route = buildRouteFromActiveRecord(activeOrder, activeRecord, rider, pickupNodeId, dropoffNodeId);
        }
        Restaurant restaurant = activeOrder == null || activeOrder.restaurantId == null
            ? null
            : restaurantRepository.findById(activeOrder.restaurantId).orElse(null);
        double total = activeRecord == null ? activeOrder == null ? 0.0 : activeOrder.totalPrice : activeRecord.getTotal();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("availableRiders", deliveryService.getRiderHeap().getSize());
        payload.put("currentNode", rider == null || !hasText(rider.getCurrentNodeId()) ? "NODE_FSKTM" : rider.getCurrentNodeId());
        payload.put("activeZones", List.of("NODE_FSKTM", "NODE_LIBRARY", "NODE_UM_CENTRAL"));
        payload.put("earnings", route == null ? 0.0 : Math.max(4.5, route.getTotalDistanceKm() * 2.0));
        payload.put("assignedOrder", toTrackingOrder(activeOrder, route, restaurant, rider, dropoffNodeId, total));
        payload.put("latestRoute", route);
        payload.put("pickupNodeId", pickupNodeId);
        payload.put("dropoffNodeId", dropoffNodeId);
        return payload;
    }

    @GetMapping("/riders/active")
    public List<Map<String, Object>> getActiveRiders() {
        return toActiveRiderRows();
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        UserHashMap userLookup = new UserHashMap();
        for (User user : userRepository.findAll()) {
            userLookup.put(user.getUserId(), user);
        }

        User foundUser = userLookup.get(userId);
        if (foundUser == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(foundUser);
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        User savedUser = userRepository.save(user);
        deliveryService.hydrateRuntimeData();
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User user) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }

        user.setUserId(userId);
        User savedUser = userRepository.save(user);
        deliveryService.hydrateRuntimeData();
        return ResponseEntity.ok(savedUser);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(userId);
        deliveryService.hydrateRuntimeData();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/restaurants")
    public List<Restaurant> getRestaurants() {
        return restaurantRepository.findAll();
    }

    @PostMapping("/restaurants")
    public ResponseEntity<Restaurant> addRestaurant(@RequestBody Restaurant restaurant) {
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        deliveryService.hydrateRuntimeData();
        return ResponseEntity.ok(savedRestaurant);
    }

    @PutMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable String restaurantId, @RequestBody Restaurant restaurant) {
        if (restaurantRepository.findById(restaurantId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        restaurant.setRestaurantId(restaurantId);
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        deliveryService.hydrateRuntimeData();
        return ResponseEntity.ok(savedRestaurant);
    }

    @DeleteMapping("/restaurants/{restaurantId}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable String restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            return ResponseEntity.notFound().build();
        }

        restaurantRepository.deleteById(restaurantId);
        deliveryService.hydrateRuntimeData();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/locations")
    public List<Map<String, Object>> getLocations() {
        return List.of(
            graphLocation("NODE_KK8"),
            graphLocation("NODE_CAFE_KK8"),
            graphLocation("NODE_KK10"),
            graphLocation("NODE_CAFE_KK10"),
            graphLocation("NODE_FSKTM"),
            graphLocation("NODE_APM"),
            graphLocation("NODE_KK3"),
            graphLocation("NODE_KK4&7"),
            graphLocation("NODE_IT"),
            graphLocation("NODE_FLL"),
            graphLocation("NODE_KAFE_BAHASA"),
            graphLocation("NODE_KK9"),
            graphLocation("NODE_BAYU_CAFE"),
            graphLocation("NODE_SCIENCE_FACULTY"),
            graphLocation("NODE_KAFE_SAINS"),
            graphLocation("NODE_KPS"),
            graphLocation("NODE_DTC"),
            graphLocation("NODE_PUSAT_ASASI_SAINS"),
            graphLocation("NODE_UMX"),
            graphLocation("NODE_IPS"),
            graphLocation("NODE_YOGO"),
            graphLocation("NODE_FOODY_AVENUE_HESHE12"),
            graphLocation("NODE_KK12_BLOCK_A"),
            graphLocation("NODE_KK12_BLOCK_B"),
            graphLocation("NODE_NOVI_KAFE"),
            graphLocation("NODE_UMCCED"),
            graphLocation("NODE_KK5"),
            graphLocation("NODE_WARONG_LIMA"),
            graphLocation("NODE_KK11"),
            graphLocation("NODE_KK11_FOODCOURT"),
            graphLocation("NODE_UM_ARENA"),
            graphLocation("NODE_API"),
            graphLocation("NODE_Q_BISTRO"),
            graphLocation("NODE_LAW"),
            graphLocation("NODE_KK1"),
            graphLocation("NODE_ASTAR_CAFE"),
            graphLocation("NODE_EXAM_HALL"),
            graphLocation("NODE_KK6"),
            graphLocation("NODE_TOAST_KITA"),
            graphLocation("NODE_BUILT_ENV"),
            graphLocation("NODE_MEDI_CAFE"),
            graphLocation("NODE_MEDICINE"),
            graphLocation("NODE_PHARMACY"),
            graphLocation("NODE_CAFE_KK2"),
            graphLocation("NODE_KK2"),
            graphLocation("NODE_ENGINEERING"),
            graphLocation("NODE_ENG_CHICKEN_RICE"),
            graphLocation("NODE_KH_SHAWARMA"),
            graphLocation("NODE_LIBRARY"),
            graphLocation("NODE_ZUS"),
            graphLocation("NODE_UM_CENTRAL"),
            graphLocation("Node_Study_Area"),
            graphLocation("Node_Edu_Fac"),
            graphLocation("NODE_FBE"),
            graphLocation("NODE_POKOK_CAFE")
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

    private Map<String, Object> graphLocation(String nodeId) {
        if (nodeId == null || nodeId.isBlank()) {
            return location("", "", 0, 0);
        }

        GraphNode node = deliveryService.getCampusMap().getNodeById(nodeId);
        if (node == null) {
            return location(nodeId, nodeId, 0, 0);
        }

        return location(node.nodeId, node.name, node.latitude, node.longitude);
    }

    private Map<String, Object> quoteFees(String restaurantId, String deliveryNodeId) {
        Order feeOrder = new Order();
        feeOrder.restaurantId = restaurantId;
        feeOrder.deliveryNodeId = deliveryNodeId;
        double distanceKm = deliveryService.calculateDeliveryDistanceKm(feeOrder);
        Map<String, Object> feeQuote = new LinkedHashMap<>();
        feeQuote.put("distanceKm", distanceKm);
        feeQuote.put("deliveryFee", deliveryService.calculateDeliveryFee(distanceKm));
        feeQuote.put("platformFee", deliveryService.calculatePlatformFee(distanceKm));
        return feeQuote;
    }

    private List<Order> getActiveOrdersForMonitoring() {
        List<Order> orders = new ArrayList<>(deliveryService.getOrderQueue().toList());
        for (ActiveOrderRecord record : activeOrderRepository.findByActiveTrueOrderByTimestampAsc()) {
            if (!containsOrder(orders, record.getOrderId())) {
                orders.add(toOrder(record));
            }
        }
        return orders;
    }

    private boolean containsOrder(List<Order> orders, String orderId) {
        return orders.stream().anyMatch((order) -> order.orderId != null && order.orderId.equals(orderId));
    }

    private RouteSummary getDbBackedLatestRoute() {
        RouteSummary route = deliveryService.getLatestRouteSummary();
        if (route != null) {
            return route;
        }

        ActiveOrderRecord activeRecord = findActiveOrderRecord(deliveryService.getLatestDispatchedOrder());
        if (activeRecord == null) {
            return null;
        }

        Order order = toOrder(activeRecord);
        return buildRouteFromActiveRecord(
            order,
            activeRecord,
            findAssignedRider(order),
            resolvePickupNodeId(order, activeRecord),
            resolveDropoffNodeId(order, activeRecord)
        );
    }

    private User findAssignedRider(Order order) {
        if (order == null || order.assignedRiderId == null || order.assignedRiderId.isBlank()) {
            return null;
        }

        return userRepository.findById(order.assignedRiderId).orElse(null);
    }

    private ActiveOrderRecord findActiveOrderRecord(Order activeOrder) {
        if (activeOrder != null && activeOrder.orderId != null) {
            return activeOrderRepository.findById(activeOrder.orderId).orElse(null);
        }

        return activeOrderRepository.findTopByCustomerIdAndActiveTrueOrderByTimestampDesc(DEFAULT_CUSTOMER_ID)
            .or(() -> activeOrderRepository.findTopByActiveTrueOrderByTimestampDesc())
            .orElse(null);
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

    private List<MenuItem> getMenuItemsFromDatabase() {
        MenuBST menuDatabase = new MenuBST();
        for (MenuItem item : menuItemRepository.findAll()) {
            menuDatabase.insert(item);
        }
        return menuDatabase.inOrderTraversal();
    }

    private String resolvePickupNodeId(Order activeOrder, ActiveOrderRecord activeRecord) {
        if (hasText(activeRecord == null ? null : activeRecord.getPickupNodeId())) {
            return activeRecord.getPickupNodeId();
        }

        return activeOrder == null ? deliveryService.getLatestPickupNodeId() : deliveryService.getRestaurantNodeForOrder(activeOrder);
    }

    private String resolveDropoffNodeId(Order activeOrder, ActiveOrderRecord activeRecord) {
        if (hasText(activeRecord == null ? null : activeRecord.getDropoffNodeId())) {
            return activeRecord.getDropoffNodeId();
        }

        return activeOrder == null ? deliveryService.getLatestDropoffNodeId() : deliveryService.getCustomerNodeForOrder(activeOrder);
    }

    private String resolveRiderNodeId(ActiveOrderRecord activeRecord, User rider, String fallbackNodeId) {
        if (hasText(activeRecord == null ? null : activeRecord.getRiderNodeId())) {
            return normalizeKnownNodeId(activeRecord.getRiderNodeId(), fallbackNodeId);
        }

        if (rider != null && hasText(rider.getCurrentNodeId())) {
            return normalizeKnownNodeId(rider.getCurrentNodeId(), fallbackNodeId);
        }

        return fallbackNodeId;
    }

    private RouteSummary buildRouteFromActiveRecord(Order order, ActiveOrderRecord record, User rider, String pickupNodeId, String dropoffNodeId) {
        if (order == null || record == null || !hasText(order.assignedRiderId)) {
            return null;
        }

        String riderNodeId = resolveRiderNodeId(record, rider, pickupNodeId);
        String resolvedPickupNodeId = normalizeKnownNodeId(pickupNodeId, "NODE_UM_CENTRAL");
        String resolvedDropoffNodeId = normalizeKnownNodeId(dropoffNodeId, "NODE_KK12_BLOCK_A");

        try {
            RouteSummary riderToRestaurant = deliveryService.getCampusMap().runDijkstra(
                riderNodeId,
                resolvedPickupNodeId,
                order.orderId,
                order.assignedRiderId
            );
            RouteSummary restaurantToCustomer = deliveryService.getCampusMap().runDijkstra(
                resolvedPickupNodeId,
                resolvedDropoffNodeId,
                order.orderId,
                order.assignedRiderId
            );
            return combineRouteSummaries(riderToRestaurant, restaurantToCustomer);
        } catch (IllegalArgumentException error) {
            return null;
        }
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

    private String normalizeKnownNodeId(String nodeId, String fallbackNodeId) {
        if (!hasText(nodeId)) {
            return fallbackNodeId;
        }

        String resolvedNodeId = switch (nodeId) {
            case "CENTRAL_EATERY" -> "NODE_UM_CENTRAL";
            case "ENGINEERING_QUAD" -> "NODE_ENGINEERING";
            case "LIBRARY" -> "NODE_LIBRARY";
            case "FSKTM_BLOCK_A" -> "NODE_FSKTM";
            case "KK12" -> "NODE_KK12_BLOCK_A";
            default -> nodeId;
        };

        return deliveryService.getCampusMap().getNodeById(resolvedNodeId) == null ? fallbackNodeId : resolvedNodeId;
    }

    private String resolveCustomerDeliveryNodeId(User customer) {
        return normalizeKnownNodeId(customer == null ? null : customer.getCurrentNodeId(), "NODE_KK12_BLOCK_A");
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private Map<String, Object> toTrackingOrder(Order order, RouteSummary route, Restaurant restaurant, User rider, String dropoffNodeId, double total) {
        Map<String, Object> activeOrder = new LinkedHashMap<>();
        if (order == null) {
            activeOrder.put("id", "");
            activeOrder.put("vendor", "");
            activeOrder.put("destination", "");
            activeOrder.put("rider", "");
            activeOrder.put("riderId", "");
            activeOrder.put("status", "NO_ACTIVE_ORDER");
            activeOrder.put("eta", 0);
            activeOrder.put("total", 0.0);
            activeOrder.put("timestamp", 0);
            return activeOrder;
        }

        activeOrder.put("id", order.orderId);
        activeOrder.put("vendor", restaurant == null ? order.restaurantId : restaurant.getRestaurantName());
        activeOrder.put("destination", dropoffNodeId);
        activeOrder.put("rider", rider == null ? "Waiting for rider assignment" : rider.getFullName());
        activeOrder.put("riderId", rider == null ? "" : rider.getUserId());
        activeOrder.put("status", order.status);
        activeOrder.put("eta", route == null ? 0 : Math.ceil(route.getEstimatedTimeMinutes()));
        activeOrder.put("total", total);
        activeOrder.put("timestamp", order.timestamp);
        return activeOrder;
    }

    private List<Map<String, Object>> toOrderRows(List<Order> orders) {
        return orders.stream().map((order) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", order.orderId);
            row.put("customer", order.customerId == null ? "Current customer" : order.customerId);
            row.put("vendor", order.restaurantId == null ? "Mixed restaurants" : order.restaurantId);
            row.put("rider", order.assignedRiderId == null ? "Assign Rider" : riderName(order.assignedRiderId));
            row.put("status", order.status);
            row.put("total", order.totalPrice);
            row.put("pickup", order.restaurantId == null ? "Restaurant" : order.restaurantId);
            row.put("dropoff", order.deliveryNodeId == null ? "NODE_KK12_BLOCK_A" : order.deliveryNodeId);
            row.put("eta", latestEta());
            row.put("time", order.timestamp);
            return row;
        }).toList();
    }

    private List<Map<String, Object>> toActiveRiderRows() {
        return deliveryService.getRiderHeap().toList().stream()
            .map(this::toActiveRiderRow)
            .toList();
    }

    private Map<String, Object> toActiveRiderRow(User rider) {
        GraphNode node = deliveryService.getCampusMap().getNodeById(rider.getCurrentNodeId());
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("userId", rider.getUserId());
        row.put("fullName", rider.getFullName());
        row.put("status", rider.getStatus());
        row.put("available", rider.isAvailable());
        row.put("currentNodeId", rider.getCurrentNodeId());
        row.put("nodeName", node == null ? rider.getCurrentNodeId() : node.name);
        row.put("latitude", node == null ? 0 : node.latitude);
        row.put("longitude", node == null ? 0 : node.longitude);
        return row;
    }

    private Map<String, Object> toActiveOrder() {
        Order order = deliveryService.getLatestDispatchedOrder();
        ActiveOrderRecord activeRecord = findActiveOrderRecord(order);
        if (order == null && activeRecord != null) {
            order = toOrder(activeRecord);
        }

        User rider = findAssignedRider(order);
        RouteSummary route = getDbBackedLatestRoute();
        Map<String, Object> activeOrder = new LinkedHashMap<>();
        activeOrder.put("id", order == null ? "No dispatched order" : order.orderId);
        activeOrder.put("vendor", order == null ? "Awaiting dispatch" : order.restaurantId);
        activeOrder.put("destination", order == null ? "No active destination" : order.deliveryNodeId);
        activeOrder.put("rider", rider == null ? "Unassigned" : rider.getFullName());
        activeOrder.put("riderId", rider == null ? "" : rider.getUserId());
        activeOrder.put("status", order == null ? "No Active Delivery" : order.status);
        activeOrder.put("eta", latestEta());
        activeOrder.put("total", order == null ? 0.0 : order.totalPrice);
        activeOrder.put("timestamp", order == null ? 0 : order.timestamp);
        return activeOrder;
    }

    private String riderName(String riderId) {
        if (riderId == null || riderId.isBlank()) {
            return "Unassigned";
        }

        User rider = deliveryService.getUsers().findUserById(riderId);
        return rider == null ? riderId : rider.getFullName();
    }

    private String latestEta() {
        RouteSummary route = getDbBackedLatestRoute();
        if (route == null) {
            return "0";
        }
        return String.valueOf(Math.ceil(route.getEstimatedTimeMinutes()));
    }
}
