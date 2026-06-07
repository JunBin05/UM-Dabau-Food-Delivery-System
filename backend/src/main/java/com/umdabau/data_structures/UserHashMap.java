package com.umdabau.data_structures;

import java.util.HashMap;
import java.util.Map;

import com.umdabau.models.User;

public class UserHashMap {
    
    // We import and use the standard Java HashMap!
    private Map<String, User> map;

    public UserHashMap() {
        // Initialize the empty hash table
        this.map = new HashMap<>();
    }

    // 1. Key-Value Usage (Inserting Data)
    public void put(String key, User user) {
        map.put(key, user);
    }

    // 2. Fast Data Access O(1) (Retrieving Data)
    public User get(String key) {
        return map.get(key); // Instant jump, no loops!
    }

    // Optional: Useful for checking if a user exists instantly
    public boolean contains(String key) {
        return map.containsKey(key);
    }
    
    // Optional: Delete user in O(1) time
    public void remove(String key) {
        map.remove(key);
    }
}