package com.umdabau.data_structures;

import java.util.HashMap;
import java.util.Map;

import com.umdabau.models.User;

/**
 * Small wrapper around a hash table for quick user lookup by ID.
 * The linked list still owns the ordering; this map is only the fast index.
 */
public class UserHashMap {
    
    // Key = userId, value = user record.
    private Map<String, User> map;

    public UserHashMap() {
        this.map = new HashMap<>();
    }

    // Store or replace a user in the index.
    public void put(String key, User user) {
        map.put(key, user);
    }

    // Average O(1) lookup instead of scanning the whole user list.
    public User get(String key) {
        return map.get(key);
    }

    // Used before insert so duplicate IDs can be rejected quickly.
    public boolean contains(String key) {
        return map.containsKey(key);
    }
    
    // Keep the index clean when a user is deleted from the linked list.
    public void remove(String key) {
        map.remove(key);
    }
}
