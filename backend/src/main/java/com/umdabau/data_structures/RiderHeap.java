package com.umdabau.data_structures;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

import com.umdabau.models.User;

/**
 * RiderHeap implements a Min-Heap using Java's built-in PriorityQueue to manage delivery riders.
 * It prioritizes riders based on the lowest distance/time score.
 * This guarantees O(1) retrieval of the best rider and O(log n) insertion/extraction.
 */
public class RiderHeap {

    /**
     * Internal wrapper class to securely pair a User object with a priority score
     * without breaking domain boundaries or altering the shared User model.
     */
    private class RiderNode {
        User rider;
        double priorityScore; // Lower score = better priority (e.g., shortest distance)

        RiderNode(User rider, double priorityScore) {
            this.rider = rider;
            this.priorityScore = priorityScore;
        }
    }

    // Java's built-in priority queue engine
    private PriorityQueue<RiderNode> queue; 
    private int capacity; // Maximum allowed riders

    public RiderHeap(int capacity) {
        this.capacity = capacity;
        
        // Initialize the built-in PriorityQueue.
        // We pass a Comparator so Java knows exactly how to sort the nodes (lowest score wins).
        this.queue = new PriorityQueue<>(capacity, Comparator.comparingDouble(n -> n.priorityScore));
    }

    /**
     * INSERT: Adds a new rider into the pool. Java automatically maintains the Min-Heap property.
     * Time Complexity: O(log n)
     * @param rider The delivery rider.
     * @param distanceScore The rider's calculated priority score.
     */
    public void insert(User rider, double distanceScore) {
        if (queue.size() >= capacity) {
            System.out.println("Heap is full! Cannot add more riders.");
            return;
        }
        
        // .offer() inserts the element and automatically bubbles it to the right position
        queue.offer(new RiderNode(rider, distanceScore));
    }

    /**
     * EXTRACT MIN: Removes and returns the rider with the lowest priority score.
     * Time Complexity: O(log n)
     * @return The User (rider) with the absolute shortest distance.
     */
    public User extractBestRider() {
        if (queue.isEmpty()) {
            return null;
        }
        
        // .poll() automatically grabs the root (best) node and reorganizes the tree
        RiderNode bestNode = queue.poll();
        return bestNode.rider;
    }

    public User pop() {
        return extractBestRider();
    }

    public int getSize() {
        return queue.size();
    }

    public List<User> toList() {
        List<User> riders = new ArrayList<>();

        for (RiderNode node : queue) {
            riders.add(node.rider);
        }

        return riders;
    }

    public boolean isEmpty() {
        return queue.isEmpty();
    }
}