package com.umdabau.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.umdabau.data_structures.CartStack;
import com.umdabau.models.ActiveOrderRecord;
import com.umdabau.models.CartActionRecord;
import com.umdabau.models.CartItemRecord;
import com.umdabau.models.GraphNode;
import com.umdabau.models.MenuItem;
import com.umdabau.models.Order;
import com.umdabau.models.RouteSummary;
import com.umdabau.models.User;
import com.umdabau.repository.ActiveOrderRepository;
import com.umdabau.repository.CartActionRepository;
import com.umdabau.repository.CartItemRepository;
import com.umdabau.repository.UserRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class OrderController {
    private static final String DEFAULT_CUSTOMER_ID = "USR-001";
    private static final double DELIVERY_FEE = 0;
    private static final double PLATFORM_FEE = 0;

    private final CartStack activeCart = new CartStack();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired
    private DeliveryService deliveryService; // <-- Talk to the Service, not another Controller!

    @Autowired
    private ActiveOrderRepository activeOrderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartActionRepository cartActionRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/cart/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody MenuItem item) {
        System.out.println("Received cart item: " + item.getName());
        saveOrIncrementCartItem(item);
        saveCartAction(item);
        activeCart.push(item);
        return ResponseEntity.ok(cartResponse("Item added."));
    }

    @GetMapping("/cart")
    public ResponseEntity<List<MenuItem>> getCartItems() {
        // SMART HYDRATION: Only rebuild if the RAM stack is completely empty.
        if (activeCart.isEmpty() && cartItemRepository.countByCustomerId(DEFAULT_CUSTOMER_ID) > 0) {
            ensureCartActionHistory();
            // IMPORTANT: Use Actions, not Database, so the Stack maintains perfect chronological order for Undo!
            hydrateCartStackFromActions(); 
        }
        return ResponseEntity.ok(activeCart.toList());
    }

    @GetMapping("/cart/count")
    public ResponseEntity<Integer> getCartCount() {
        // SMART HYDRATION check here too
        if (activeCart.isEmpty() && cartItemRepository.countByCustomerId(DEFAULT_CUSTOMER_ID) > 0) {
            ensureCartActionHistory();
            hydrateCartStackFromActions();
        }
        return ResponseEntity.ok(activeCart.getSize());
    }

    @GetMapping("/cart/undo-available")
    public ResponseEntity<Map<String, Object>> getCartUndoAvailable() {
        ensureCartActionHistory();
        return ResponseEntity.ok(Map.of("undoAvailable", cartActionRepository.countByCustomerId(DEFAULT_CUSTOMER_ID) > 0));
    }

    @PostMapping("/cart/undo")
    public ResponseEntity<Map<String, Object>> undoLastCartAction() {

        // 1. STACK FIRST: Pop the item instantly in O(1) time.
        MenuItem removedItem = activeCart.pop();

        if (removedItem == null) {
            return ResponseEntity.ok(cartResponse("No cart action to undo."));
        }

        // 2. DATABASE SECOND: Now that the stack is updated, clean up the database in the background.
        CartActionRecord latestAction = cartActionRepository.findTopByCustomerIdOrderByIdDesc(DEFAULT_CUSTOMER_ID).orElse(null);
        if (latestAction != null) {
            cartActionRepository.delete(latestAction);
        }
        decrementCartItem(removedItem);
        
        return ResponseEntity.ok(cartResponse("Last cart action undone."));
    }

    @PostMapping("/cart/remove")
    public ResponseEntity<MenuItem> removeOneCartItem(@RequestBody MenuItem item) {
        // 1. STACK FIRST
        MenuItem removedItem = activeCart.removeOne(item);

        if (removedItem == null) {
            return ResponseEntity.notFound().build();
        }

        // 2. DATABASE SECOND
        decrementCartItem(removedItem);
        deleteLatestCartAction(removedItem);
        return ResponseEntity.ok(removedItem);
    }

    @PostMapping("/cart/remove-all")
    public ResponseEntity<String> removeAllCartItems(@RequestBody MenuItem item) {
        // 1. STACK FIRST
        int removedCount = activeCart.removeAll(item);

        if (removedCount == 0) {
            return ResponseEntity.notFound().build();
        }

        // 2. DATABASE SECOND
        deleteAllCartRecords(item);
        deleteAllCartActions(item);
        return ResponseEntity.ok("Removed " + removedCount + " item(s).");
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkoutOrder(@RequestBody Order newOrder) {
        // 1. ADD THIS CHECK: Don't allow checking out an empty cart!
        if (activeCart.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot checkout: Cart is empty."));
        }

        List<MenuItem> checkedOutItems = activeCart.toList();
        newOrder.cart = checkedOutItems;
        newOrder.status = "PENDING_DISPATCH";
        newOrder.timestamp = System.currentTimeMillis();
        double subtotal = checkedOutItems.stream()
            .mapToDouble(MenuItem::getPrice)
            .sum();
        newOrder.totalPrice = subtotal;

        if (newOrder.orderId == null || newOrder.orderId.isBlank()) {
            newOrder.orderId = "ORD-" + newOrder.timestamp;
        }

        if (newOrder.customerId == null || newOrder.customerId.isBlank()) {
            newOrder.customerId = DEFAULT_CUSTOMER_ID;
        }

        if ((newOrder.restaurantId == null || newOrder.restaurantId.isBlank()) && !checkedOutItems.isEmpty()) {
            newOrder.restaurantId = checkedOutItems.get(0).getRestaurantId();
        }

        if (newOrder.deliveryNodeId == null || newOrder.deliveryNodeId.isBlank()) {
            newOrder.deliveryNodeId = savedCustomerDeliveryNodeId();
        }
        
        // Put the order into the globally shared queue!
        deliveryService.getOrderQueue().enqueue(newOrder);
        deliveryService.setLatestCustomerOrder(newOrder);
        saveActiveOrder(newOrder, subtotal, DELIVERY_FEE, PLATFORM_FEE, true);

        RouteSummary routeSummary = null;
        boolean assigned = false;

        try {
            routeSummary = deliveryService.assignNextOrder();
            assigned = routeSummary != null;
        } catch (IllegalArgumentException error) {
            assigned = false;
        }
        saveActiveOrder(newOrder, subtotal, DELIVERY_FEE, PLATFORM_FEE, true);
        cartItemRepository.deleteAll(cartItemRepository.findByCustomerIdOrderByIdAsc(DEFAULT_CUSTOMER_ID));
        cartActionRepository.deleteAll(cartActionRepository.findByCustomerIdOrderByIdAsc(DEFAULT_CUSTOMER_ID));
        activeCart.clear();

        Map<String, Object> response = new LinkedHashMap<>();
        String riderName = deliveryService.getLatestAssignedRider() == null ? "" : deliveryService.getLatestAssignedRider().getFullName();
        response.put("message", assigned ? "Driver found: " + riderName + ". Your order is now on the way." : "Order queued. Waiting for an available rider.");
        response.put("orderId", newOrder.orderId);
        response.put("hasActiveOrder", true);
        response.put("status", newOrder.status);
        response.put("assigned", assigned);
        response.put("routeSummary", routeSummary);
        response.put("riderName", riderName);
        response.put("pendingOrders", deliveryService.getOrderQueue().getSize());
        response.put("subtotal", subtotal);
        response.put("deliveryFee", DELIVERY_FEE);
        response.put("platformFee", PLATFORM_FEE);
        response.put("total", subtotal + DELIVERY_FEE + PLATFORM_FEE);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/received")
    public ResponseEntity<Map<String, Object>> markOrderReceived() {
        Order completedOrder = deliveryService.completeLatestDelivery();
        ActiveOrderRecord completedRecord = null;

        if (completedOrder == null) {
            completedRecord = activeOrderRepository
                .findTopByCustomerIdAndActiveTrueOrderByTimestampDesc(DEFAULT_CUSTOMER_ID)
                .orElseGet(() -> activeOrderRepository.findTopByActiveTrueOrderByTimestampDesc().orElse(null));

            if (completedRecord == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "No active delivery to complete."));
            }

            completedRecord.setStatus("DELIVERED");
            completedRecord.setActive(false);
            activeOrderRepository.save(completedRecord);
        } else {
            completedRecord = activeOrderRepository.findById(completedOrder.orderId).orElse(null);
            if (completedRecord != null) {
                completedRecord.setStatus("DELIVERED");
                completedRecord.setActive(false);
                activeOrderRepository.save(completedRecord);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Order received. Delivery completed.");
        response.put("orderId", completedOrder != null ? completedOrder.orderId : completedRecord.getOrderId());
        response.put("status", "DELIVERED");
        response.put("availableRiders", deliveryService.getRiderHeap().getSize());
        return ResponseEntity.ok(response);
    }

    private void hydrateCartStackFromActions() {
        ensureCartActionHistory();
        activeCart.clear();
        for (CartActionRecord record : cartActionRepository.findByCustomerIdOrderByIdAsc(DEFAULT_CUSTOMER_ID)) {
            activeCart.push(toMenuItem(record));
        }
    }

    private void saveOrIncrementCartItem(MenuItem item) {
        List<CartItemRecord> records = cartItemRepository.findByCustomerIdAndMenuItemId(DEFAULT_CUSTOMER_ID, menuItemId(item));
        CartItemRecord record = records.isEmpty() ? new CartItemRecord() : records.get(0);
        int currentQuantity = records.stream()
            .mapToInt((cartRecord) -> Math.max(cartRecord.getQuantity(), 1))
            .sum();

        record.setCustomerId(DEFAULT_CUSTOMER_ID);
        record.setMenuItemId(menuItemId(item));
        record.setItemName(item.getName());
        record.setRestaurantId(item.getRestaurantId());
        record.setRestaurantName("");
        record.setPrice(item.getPrice());
        record.setQuantity(currentQuantity + 1);
        record.setCategory(item.getCategory());
        record.setDescription("");
        record.setAddedOrder(System.currentTimeMillis());
        cartItemRepository.save(record);

        if (records.size() > 1) {
            cartItemRepository.deleteAll(records.subList(1, records.size()));
        }
    }

    private void decrementCartItem(MenuItem item) {
        CartItemRecord record = cartItemRepository.findFirstByCustomerIdAndMenuItemIdOrderByIdAsc(DEFAULT_CUSTOMER_ID, menuItemId(item))
            .orElse(null);

        if (record == null) {
            return;
        }

        if (record.getQuantity() <= 1) {
            cartItemRepository.delete(record);
            return;
        }

        record.setQuantity(record.getQuantity() - 1);
        cartItemRepository.save(record);
    }

    private void saveCartAction(MenuItem item) {
        CartActionRecord record = new CartActionRecord();
        record.setCustomerId(DEFAULT_CUSTOMER_ID);
        record.setMenuItemId(menuItemId(item));
        record.setItemName(item.getName());
        record.setRestaurantId(item.getRestaurantId());
        record.setRestaurantName("");
        record.setPrice(item.getPrice());
        record.setCategory(item.getCategory());
        record.setActionType("ADD");
        record.setCreatedAt(System.currentTimeMillis());
        cartActionRepository.save(record);
    }

    private void ensureCartActionHistory() {
        for (CartItemRecord record : cartItemRepository.findByCustomerIdOrderByIdAsc(DEFAULT_CUSTOMER_ID)) {
            int quantity = Math.max(record.getQuantity(), 1);
            long actionCount = cartActionRepository.countByCustomerIdAndMenuItemId(DEFAULT_CUSTOMER_ID, record.getMenuItemId());
            long missingActions = quantity - actionCount;

            for (int count = 0; count < quantity && missingActions > 0; count++) {
                saveCartAction(toMenuItem(record));
                missingActions--;
            }
        }
    }

    private MenuItem toMenuItem(CartItemRecord record) {
        return new MenuItem(
            record.getMenuItemId(),
            record.getRestaurantId(),
            record.getItemName(),
            record.getPrice(),
            record.getCategory()
        );
    }

    private MenuItem toMenuItem(CartActionRecord record) {
        return new MenuItem(
            record.getMenuItemId(),
            record.getRestaurantId(),
            record.getItemName(),
            record.getPrice(),
            record.getCategory()
        );
    }

    private void deleteLatestCartAction(MenuItem item) {
        cartActionRepository.findTopByCustomerIdAndMenuItemIdOrderByIdDesc(DEFAULT_CUSTOMER_ID, menuItemId(item))
            .ifPresent(cartActionRepository::delete);
    }

    private void deleteAllCartRecords(MenuItem item) {
        cartItemRepository.deleteAll(cartItemRepository.findByCustomerIdAndMenuItemId(DEFAULT_CUSTOMER_ID, menuItemId(item)));
    }

    private void deleteAllCartActions(MenuItem item) {
        cartActionRepository.deleteAll(cartActionRepository.findByCustomerIdAndMenuItemId(DEFAULT_CUSTOMER_ID, menuItemId(item)));
    }

    private Map<String, Object> cartResponse(String message) {
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", message);
        
        // 1. Trust the Stack! Read directly from RAM.
        response.put("items", activeCart.toList()); 
        
        // 2. We can even check if Undo is available just by asking the Stack if it's empty!
        response.put("undoAvailable", !activeCart.isEmpty()); 
        
        return response;
    }

    private String menuItemId(MenuItem item) {
        if (item.getItemId() != null && !item.getItemId().isBlank()) {
            return item.getItemId();
        }

        return item.getName();
    }

    private String savedCustomerDeliveryNodeId() {
        return userRepository.findById(DEFAULT_CUSTOMER_ID)
            .map(User::getCurrentNodeId)
            .filter((nodeId) -> nodeId != null && !nodeId.isBlank())
            .orElse("NODE_KK12_BLOCK_A");
    }

    private void saveActiveOrder(Order order, double subtotal, double deliveryFee, double platformFee, boolean active) {
        ActiveOrderRecord record = activeOrderRepository.findById(order.orderId).orElseGet(ActiveOrderRecord::new);
        record.setOrderId(order.orderId);
        record.setCustomerId(order.customerId);
        record.setRestaurantId(order.restaurantId);
        record.setAssignedRiderId(order.assignedRiderId);
        record.setDeliveryNodeId(order.deliveryNodeId);
        record.setPickupNodeId(deliveryService.getRestaurantNodeForOrder(order));
        record.setDropoffNodeId(deliveryService.getCustomerNodeForOrder(order));
        record.setRiderNodeId(resolveRiderNodeId(order));
        record.setStatus(order.status);
        record.setTimestamp(order.timestamp);
        record.setSubtotal(subtotal);
        record.setDeliveryFee(deliveryFee);
        record.setPlatformFee(platformFee);
        record.setTotal(subtotal + deliveryFee + platformFee);
        record.setActive(active);

        try {
            record.setItemsJson(objectMapper.writeValueAsString(order.cart));
        } catch (JsonProcessingException error) {
            record.setItemsJson("[]");
        }

        activeOrderRepository.save(record);
    }

    private String resolveRiderNodeId(Order order) {
        RouteSummary route = deliveryService.getLatestRouteSummary();
        if (route != null && order.orderId != null && order.orderId.equals(route.getOrderId())) {
            GraphNode[] path = route.getPath();
            if (path != null && path.length > 0 && path[0] != null) {
                return path[0].nodeId;
            }
        }

        User rider = deliveryService.getLatestAssignedRider();
        if (rider != null && order.assignedRiderId != null && order.assignedRiderId.equals(rider.getUserId())) {
            return rider.getCurrentNodeId();
        }

        return "";
    }

}
