package com.umdabau.data_structures;

import java.util.HashMap;
import java.util.Map;

import com.umdabau.models.Restaurant;

public class RestaurantHashMap {
    
    // We import and use the standard Java HashMap
    private Map<String, Restaurant> map;

    public RestaurantHashMap() {
        // Initialize the empty hash table
        this.map = new HashMap<>();
    }

    // 1. Key-Value Usage (Inserting Data)
    public void put(String key, Restaurant restaurant) {
        map.put(key, restaurant);
    }

    // 2. Fast Data Access O(1) (Retrieving Data)
    public Restaurant get(String key) {
        return map.get(key); // Instant jump, no loops!
    }

    // 3. Useful for checking if a restaurant exists instantly O(1)
    public boolean contains(String key) {
        return map.containsKey(key);
    }
    
    // 4. Delete restaurant in O(1) time
    public void remove(String key) {
        map.remove(key);
    }
}