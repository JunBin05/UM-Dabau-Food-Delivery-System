package com.umdabau.data_structures;

import com.umdabau.models.User;

/**
 * RiderHeap implements a Min-Heap using an array to manage delivery riders.
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

    private RiderNode[] heap; // Array representation of the binary tree
    private int size;         // Current number of riders in the heap
    private int capacity;     // Maximum allowed riders

    public RiderHeap(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.heap = new RiderNode[capacity];
    }

    // --- Helper Methods for Array-Based Binary Tree Traversal ---
    private int parent(int i) { return (i - 1) / 2; }
    private int leftChild(int i) { return (2 * i) + 1; }
    private int rightChild(int i) { return (2 * i) + 2; }

    /**
     * INSERT: Adds a new rider into the pool and maintains the Min-Heap property.
     * Time Complexity: O(log n)
     * @param rider The delivery rider.
     * @param distanceScore The rider's calculated priority score.
     */
    public void insert(User rider, double distanceScore) {
        if (size == capacity) {
            System.out.println("Heap is full! Cannot add more riders.");
            return;
        }

        // Insert the new node at the bottom right of the tree (end of array)
        RiderNode newNode = new RiderNode(rider, distanceScore);
        heap[size] = newNode;
        int current = size;
        size++;

        // Bubble up to restore the Min-Heap property
        heapifyUp(current);
    }

    /**
     * EXTRACT MIN: Removes and returns the rider with the lowest priority score.
     * Time Complexity: O(log n)
     * @return The User (rider) with the absolute shortest distance.
     */
    public User extractBestRider() {
        if (size <= 0) return null;
        
        // If there's only one rider, return them and empty the heap
        if (size == 1) {
            size--;
            return heap[0].rider;
        }

        // The root node (index 0) always contains the minimum value
        User bestRider = heap[0].rider;
        
        // Replace the root with the last element in the array
        heap[0] = heap[size - 1];
        size--;
        
        // Bubble down to restore the Min-Heap property
        heapifyDown(0);

        return bestRider;
    }

    /**
     * Moves a node UP the tree if it is smaller than its parent.
     */
    private void heapifyUp(int index) {
        while (index > 0 && heap[parent(index)].priorityScore > heap[index].priorityScore) {
            swap(parent(index), index);
            index = parent(index); 
        }
    }

    /**
     * Moves a node DOWN the tree if it is larger than its children.
     */
    private void heapifyDown(int index) {
        int smallest = index;
        int left = leftChild(index);
        int right = rightChild(index);

        if (left < size && heap[left].priorityScore < heap[smallest].priorityScore) {
            smallest = left;
        }
        if (right < size && heap[right].priorityScore < heap[smallest].priorityScore) {
            smallest = right;
        }
        
        if (smallest != index) {
            swap(index, smallest);
            heapifyDown(smallest);
        }
    }

    /**
     * Swaps two nodes in the heap array.
     */
    private void swap(int i, int j) {
        RiderNode temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }
    
    public boolean isEmpty() {
        return size == 0;
    }
}