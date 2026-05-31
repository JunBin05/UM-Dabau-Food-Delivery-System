package data_structures;

import models.Order;

/**
 * OrderQueue implements a custom Queue (First-In-First-Out) using linked nodes.
 * It ensures that customer orders are processed strictly in the sequence 
 * they were received, providing fairness and real-time processing.
 */
public class OrderQueue {

    /**
     * Internal Node class specifically for the Queue.
     */
    private class QueueNode {
        Order order;      // The data payload (Confirmed Order)
        QueueNode next;   // Pointer to the next order in line

        public QueueNode(Order order) {
            this.order = order;
            this.next = null;
        }
    }

    private QueueNode front; // Pointer to the oldest order (next to be processed)
    private QueueNode rear;  // Pointer to the newest order (end of the line)
    private int size;        // Total number of pending orders

    public OrderQueue() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    /**
     * ENQUEUE: Adds a new order to the back (rear) of the queue.
     * Time Complexity: O(1)
     * @param o The Order to be added.
     */
    public void enqueue(Order o) {
        QueueNode newNode = new QueueNode(o);
        
        // If the queue is empty, the new node becomes both the front and the rear
        if (this.rear == null) {
            this.front = this.rear = newNode;
        } else {
            // Otherwise, attach it behind the current rear and update the rear pointer
            this.rear.next = newNode;
            this.rear = newNode;
        }
        size++;
    }

    /**
     * DEQUEUE: Removes and returns the order at the front of the queue.
     * Time Complexity: O(1)
     * @return The oldest Order, or null if queue is empty.
     */
    public Order dequeue() {
        if (isEmpty()) {
            return null; // Return null if there are no orders to process
        }

        // Store the order at the front before moving the pointer
        QueueNode temp = this.front;
        this.front = this.front.next; // Move the front pointer to the next order in line

        // If the queue becomes empty after dequeuing, the rear must also be reset to null
        if (this.front == null) {
            this.rear = null;
        }
        
        size--;
        return temp.order;
    }

    /**
     * PEEK: Returns the order at the front of the queue without removing it.
     * Time Complexity: O(1)
     */
    public Order peek() {
        if (isEmpty()) {
            return null;
        }
        return this.front.order;
    }

    /**
     * ISEMPTY: Checks if the queue has no orders.
     * Time Complexity: O(1)
     */
    public boolean isEmpty() {
        return this.front == null;
    }

    /**
     * GETSIZE: Returns the current number of orders in the queue.
     * Time Complexity: O(1)
     */
    public int getSize() {
        return this.size;
    }
}