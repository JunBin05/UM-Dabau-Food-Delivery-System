package com.umdabau.data_structures;

import java.util.AbstractList;
import java.util.List;
import com.umdabau.models.User;

/**
 * Custom singly linked list for users.
 * A hash map index is kept beside it so lookup by userId does not need a full scan.
 */
public class UserList {
    private UserNode head;
    private UserNode tail;
    private int size;

    // Shared index for the whole list. Each node stays simple and only stores linked-list data.
    private UserHashMap userIndex;

    private static class UserNode {
        private User data;
        private UserNode next;

        private UserNode(User data) {
            this.data = data;
            this.next = null;
        }
    }

    public UserList() {
        head = null;
        tail = null;
        size = 0;
        userIndex = new UserHashMap(); 
    }

    // Add at the end using tail: O(1), after duplicate ID checking: O(1)
    public boolean addUser(User user) {
        if (user == null || user.getUserId() == null) {
            return false;
        }

        // Fast duplicate check before adding a new linked-list node.
        if (userIndex.contains(user.getUserId())) {
            return false; 
        }

        UserNode newNode = new UserNode(user);

        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail.next = newNode;
            tail = newNode;
        }

        // Keep the index in sync with the linked list.
        userIndex.put(user.getUserId(), user);
        size++;
        return true;
    }

    // Lookup uses the hash map index: average O(1) instead of linked-list O(n).
    public User findUserById(String userId) {
        if (userId == null) {
            return null;
        }
        return userIndex.get(userId);
    }

    // Update by ID: O(n) for Linked List structure traversal
    public boolean updateUser(User updatedUser) {
        if (updatedUser == null || updatedUser.getUserId() == null) {
            return false;
        }

        UserNode current = head;

        while (current != null) {
            if (updatedUser.getUserId().equals(current.data.getUserId())) {
                current.data = updatedUser;
                
                // Replace the indexed object too, otherwise lookup may return old data.
                userIndex.put(updatedUser.getUserId(), updatedUser);
                return true;
            }
            current = current.next;
        }

        return false;
    }

    // Delete by ID: O(n)
    public boolean deleteUser(String userId) {
        if (userId == null || isEmpty()) {
            return false;
        }

        UserNode current = head;
        UserNode previous = null;

        while (current != null) {
            if (userId.equals(current.data.getUserId())) {
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
                userIndex.remove(userId);
                return true;
            }

            previous = current;
            current = current.next;
        }

        return false;
    }

    // Display all users from head to tail: O(n)
    public void displayUsers() {
        if (isEmpty()) {
            System.out.println("No users found.");
            return;
        }

        UserNode current = head;

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

    public List<User> toList() {
        // AbstractList exposes the linked-list data as a List without storing a second copy.
        return new AbstractList<User>() {
            @Override
            public User get(int index) {
                if (index < 0 || index >= size) {
                    throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
                }

                UserNode current = head;
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
        
        // A fresh index avoids keeping references to users that were just cleared.
        userIndex = new UserHashMap();
    }
}