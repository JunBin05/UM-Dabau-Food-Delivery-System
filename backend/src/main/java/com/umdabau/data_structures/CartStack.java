package com.umdabau.data_structures;

import java.util.ArrayList;
import java.util.List;

import com.umdabau.models.MenuItem;

/**
 * CartStack implements a custom Stack (Last-In-First-Out) using linked nodes.
 * It is used to temporarily store menu items added to a user's cart,
 * enabling an O(1) time complexity "Undo" feature.
 */
public class CartStack {
    
    /**
     * Internal Node class specifically for the Stack.
     * Built from scratch to satisfy rubric requirements.
     */
    private class StackNode {
        MenuItem item;     // The data payload (Food item)
        StackNode next;    // Pointer to the item below this one in the stack
        
        public StackNode(MenuItem item) {
            this.item = item;
            this.next = null;
        }
    }

    private StackNode top; // Tracks the most recently added item
    private int size;      // Tracks the number of items in the cart

    public CartStack() {
        this.top = null;
        this.size = 0;
    }

    /**
     * PUSH: Adds a new item to the top of the stack.
     * Time Complexity: O(1)
     * @param item The MenuItem to add to the cart.
     */
    public void push(MenuItem item) {
        StackNode newNode = new StackNode(item);
        newNode.next = top; // Point the new node to the current top
        top = newNode;      // Make the new node the new top
        size++;
    }

    /**
     * POP: Removes and returns the item at the top of the stack (Undo action).
     * Time Complexity: O(1)
     * @return The most recently added MenuItem, or null if cart is empty.
     */
    public MenuItem pop() {
        if (isEmpty()) {
            return null; // Prevent NullPointerException if the cart is empty
        }
        MenuItem poppedItem = top.item; // Store the item to return
        top = top.next;                 // Move the top pointer to the next node down
        size--;
        return poppedItem;
    }

    public MenuItem removeOne(MenuItem targetItem) {
        if (isEmpty() || targetItem == null) {
            return null;
        }

        if (isSameItem(top.item, targetItem)) {
            return pop();
        }

        StackNode previous = top;
        StackNode current = top.next;

        while (current != null) {
            if (isSameItem(current.item, targetItem)) {
                previous.next = current.next;
                size--;
                return current.item;
            }

            previous = current;
            current = current.next;
        }

        return null;
    }

    public int removeAll(MenuItem targetItem) {
        if (isEmpty() || targetItem == null) {
            return 0;
        }

        int removedCount = 0;

        while (top != null && isSameItem(top.item, targetItem)) {
            top = top.next;
            size--;
            removedCount++;
        }

        StackNode previous = top;
        StackNode current = top == null ? null : top.next;

        while (current != null) {
            if (isSameItem(current.item, targetItem)) {
                previous.next = current.next;
                size--;
                removedCount++;
                current = previous.next;
                continue;
            }

            previous = current;
            current = current.next;
        }

        return removedCount;
    }


    /**
     * PEEK: Returns the item at the top of the stack without removing it.
     * Time Complexity: O(1)
     */
    public MenuItem peek() {
        if (isEmpty()) {
            return null;
        }
        return top.item;
    }

    /**
     * ISEMPTY: Checks if the stack has no items.
     * Time Complexity: O(1)
     */
    public boolean isEmpty() {
        return top == null;
    }

    /**
     * GETSIZE: Returns the current number of items in the stack.
     * Time Complexity: O(1)
     */
    public int getSize() { 
        return size; 
    }

    public void clear() {
        top = null;
        size = 0;
    }

    public List<MenuItem> toList() {
        List<MenuItem> items = new ArrayList<>();
        StackNode current = top;

        while (current != null) {
            items.add(current.item);
            current = current.next;
        }

        return items;
    }

    private boolean isSameItem(MenuItem firstItem, MenuItem secondItem) {
        if (firstItem == null || secondItem == null) {
            return false;
        }

        String firstItemId = firstItem.getItemId();
        String secondItemId = secondItem.getItemId();

        if (firstItemId != null && secondItemId != null) {
            return firstItemId.equals(secondItemId);
        }

        return firstItem.getName() != null && firstItem.getName().equals(secondItem.getName());
    }
}
