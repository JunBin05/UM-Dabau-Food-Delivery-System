package com.umdabau.data_structures;

import java.util.HashMap;
import java.util.Map;

import com.umdabau.models.Restaurant;

/**
 * Hash table helper for restaurant lookup by restaurantId.
 * RestaurantList keeps the linked-list structure; this class adds fast ID access.
 */
public class RestaurantHashMap {
    
    // Key = restaurantId, value = restaurant record.
    private Map<String, Restaurant> map;

    public RestaurantHashMap() {
        this.map = new HashMap<>();
    }

    // Store or replace a restaurant in the index.
    public void put(String key, Restaurant restaurant) {
        map.put(key, restaurant);
    }

    // Average O(1) lookup by restaurantId.
    public Restaurant get(String key) {
        return map.get(key);
    }

    // Used for duplicate checks before inserting into the linked list.
    public boolean contains(String key) {
        return map.containsKey(key);
    }
    
    // Remove stale index entries when the linked list deletes a restaurant.
    public void remove(String key) {
        map.remove(key);
    }
}
