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

@Service // <-- This tells Spring Boot to create EXACTLY ONE instance of this class to share!
public class DeliveryService {
    
    // The shared brain for the whole app
    private final OrderQueue globalOrderQueue = new OrderQueue();
    private final RiderHeap globalRiderHeap = new RiderHeap(100);
    private final UMGraph campusMap = new UMGraph(120);
    private final UserList users = new UserList();
    private final RestaurantList restaurants = new RestaurantList();
    private RouteSummary latestRouteSummary;
    private Order latestDispatchedOrder;

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

    private void seedUsers() {
        users.addUser(new User("USR-001", "Aina Rahman", "aina.rahman@student.um.edu.my", "Customer", "Active", false, ""));
        users.addUser(new User("USR-002", "Rafiq Lim", "rafiq.lim@rider.umdabau.local", "Rider", "Active", true, "NODE_FSKTM"));
        users.addUser(new User("USR-003", "Mei Yee", "mei.yee@rider.umdabau.local", "Rider", "Offline", false, "NODE_LIBRARY"));
        users.addUser(new User("USR-004", "Vincent Admin", "vincent.admin@umdabau.local", "Admin", "Active", false, ""));

        globalRiderHeap.insert(users.findUserById("USR-002"), 1.0);
    }

    private void seedRestaurants() {
        restaurants.addRestaurant(new Restaurant("REST-001", "Campus Cafe", "Malay & Chinese", "Open", "UM Central", "NODE_UM_CENTRAL"));
        restaurants.addRestaurant(new Restaurant("REST-002", "KK12 Quick Bites", "Malay Snacks", "Open", "KK12 Food Court", "NODE_FOODY_AVENUE_HESHE12"));
        restaurants.addRestaurant(new Restaurant("REST-003", "Central Eatery Malay Corner", "Malay", "Open", "UM Central", "NODE_UM_CENTRAL"));
        restaurants.addRestaurant(new Restaurant("REST-004", "Engineering Bites", "Western", "Open", "Engineering Quad", "NODE_ENGINEERING"));
        restaurants.addRestaurant(new Restaurant("REST-005", "Dabau Drinks Lab", "Drinks", "Open", "Library", "NODE_ZUS"));
        restaurants.addRestaurant(new Restaurant("REST-006", "Library Greens", "Vegetarian", "Closed", "Library", "NODE_LIBRARY"));
    }
}
