package com.umdabau.data_structures;

import java.util.AbstractList;
import java.util.List;

import com.umdabau.models.Restaurant;

/**
 * Custom singly linked list for restaurants.
 * A small hash map index sits beside the list for fast lookup by restaurantId.
 */
public class RestaurantList {
    private RestaurantNode head;
    private RestaurantNode tail;
    private int size;

    // Shared fast index for the whole restaurant list.
    private RestaurantHashMap restaurantIndex;

    private static class RestaurantNode {
        private Restaurant data;
        private RestaurantNode next;

        private RestaurantNode(Restaurant data) {
            this.data = data;
            this.next = null;
        }
    }

    public RestaurantList() {
        head = null;
        tail = null;
        size = 0;
        restaurantIndex = new RestaurantHashMap();
    }

    // Add at the end using tail: O(1), after duplicate ID checking: O(1)
    public boolean addRestaurant(Restaurant restaurant) {
        if (restaurant == null || restaurant.getRestaurantId() == null) {
            return false;
        }

        // Fast duplicate check before adding a new linked-list node.
        if (restaurantIndex.contains(restaurant.getRestaurantId())) {
            return false;
        }

        RestaurantNode newNode = new RestaurantNode(restaurant);

        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail.next = newNode;
            tail = newNode;
        }

        size++;
        
        // Keep the index in sync with the linked list.
        restaurantIndex.put(restaurant.getRestaurantId(), restaurant);
        return true;
    }

    // Find/search by ID: O(1)
    public Restaurant findRestaurantById(String restaurantId) {
        if (restaurantId == null) {
            return null;
        }

        // Lookup uses the hash map index instead of scanning every node.
        return restaurantIndex.get(restaurantId);
    }

    // Update by ID: O(n) for Linked List, O(1) to map
    public boolean updateRestaurant(Restaurant updatedRestaurant) {
        if (updatedRestaurant == null || updatedRestaurant.getRestaurantId() == null) {
            return false;
        }

        RestaurantNode current = head;

        while (current != null) {
            if (updatedRestaurant.getRestaurantId().equals(current.data.getRestaurantId())) {
                current.data = updatedRestaurant;
                
                // Replace the indexed object too, otherwise lookup may return old data.
                restaurantIndex.put(updatedRestaurant.getRestaurantId(), updatedRestaurant);
                return true;
            }
            current = current.next;
        }

        return false;
    }

    // Delete by ID: O(n)
    public boolean deleteRestaurant(String restaurantId) {
        if (restaurantId == null || isEmpty()) {
            return false;
        }

        RestaurantNode current = head;
        RestaurantNode previous = null;

        while (current != null) {
            if (restaurantId.equals(current.data.getRestaurantId())) {
                if (previous == null) {
                    head = current.next;
                } else {
                    previous.next = current.next;
                }

                if (current == tail) {
                    tail = previous;
                }

                size--;
                
                // Remove the ID from the fast index after the node is unlinked.
                restaurantIndex.remove(restaurantId);
                return true;
            }

            previous = current;
            current = current.next;
        }

        return false;
    }

    // Display all restaurants from head to tail: O(n)
    public void displayRestaurants() {
        if (isEmpty()) {
            System.out.println("No restaurants found.");
            return;
        }

        RestaurantNode current = head;

        while (current != null) {
            System.out.println(current.data);
            current = current.next;
        }
    }

    // isEmpty: O(1)
    public boolean isEmpty() {
        return size == 0;
    }

    // getSize: O(1)
    public int getSize() {
        return size;
    }

    public List<Restaurant> toList() {
        // AbstractList gives callers a List view without copying the linked-list data.
        return new AbstractList<Restaurant>() {
            @Override
            public Restaurant get(int index) {
                if (index < 0 || index >= size) {
                    throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
                }

                RestaurantNode current = head;
                for (int i = 0; i < index; i++) {
                    current = current.next;
                }

                return current.data;
            }

            @Override
            public int size() {
                return size;
            }
        };
    }

    // Clear the list by removing references to the first and last node: O(1)
    public void clear() {
        head = null;
        tail = null;
        size = 0;
        
        // A fresh index avoids keeping references to restaurants that were just cleared.
        restaurantIndex = new RestaurantHashMap();
    }
}