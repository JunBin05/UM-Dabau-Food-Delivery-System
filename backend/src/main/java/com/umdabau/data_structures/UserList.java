package com.umdabau.data_structures;

import java.util.AbstractList;
import java.util.List;
import com.umdabau.models.User;

public class UserList {
    private UserNode head;
    private UserNode tail;
    private int size;

    // 🌟 FIX 1: The HashMap Index belongs to the LIST, not individual nodes!
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
        // 🌟 FIX 2: Initialize the index here for the entire list scope
        userIndex = new UserHashMap(); 
    }

    // Add at the end using tail: O(1), after duplicate ID checking: O(1)
    public boolean addUser(User user) {
        if (user == null || user.getUserId() == null) {
            return false;
        }

        // 🌟 NOW CORRECTLY CHECKS THE WHOLE LIST INDEX IN O(1) CONSTANT TIME
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

        // 🌟 ADD TO HASHMAP INDEX FOR FUTURE FAST RETRIEVAL
        userIndex.put(user.getUserId(), user);
        size++;
        return true;
    }

    // 🌟 OPTIMIZED RETRIEVAL: O(1) instead of O(n) loop
    public User findUserById(String userId) {
        if (userId == null) {
            return null;
        }
        // Direct O(1) point-to-point retrieval!
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
                
                // 🌟 FIX 3: Keep the HashMap index updated with the new object reference
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
                
                // 🌟 REMOVE FROM HASHMAP INDEX SO IT DOES NOT HOLD DEAD DATA
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
        
        // 🌟 FIX 4: Reinitialize the HashMap so it is completely wiped clear too
        userIndex = new UserHashMap();
    }
}