package data_structures;

import models.User;

public class RiderHeap {

    private User[] heap; // Array representing the binary tree
    private int size;
    private int capacity;

    public RiderHeap(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.heap = new User[capacity];
    }

    // Helper math for array-based tree traversal
    private int parent(int index) { return (index - 1) / 2; }
    private int leftChild(int index) { return (2 * index) + 1; }
    private int rightChild(int index) { return (2 * index) + 2; }

    // Core Dispatch Logic
    // Calculates score based on Rider's distance to restaurant + preferred zone
    private double calculatePriorityScore(User rider) { /* Logic */ }

    // Required Core Methods
    public void insert(User rider) { /* Logic */ }
    public User extractMin() { /* Logic */ }
    private void heapify(int index) { /* Logic to bubble down */ }
    public boolean isEmpty() { return size == 0; }
}