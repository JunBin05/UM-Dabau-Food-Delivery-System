package com.umdabau.data_structures;

import com.umdabau.models.User;

public class UserList {
    private UserNode head;
    private UserNode tail;
    private int size;

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
    }

    // Add at the end using tail: O(1), after duplicate ID checking: O(n)
    public boolean addUser(User user) {
        if (user == null || user.getUserId() == null) {
            return false;
        }

        if (findUserById(user.getUserId()) != null) {
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

        size++;
        return true;
    }

    // Find/search by ID: O(n)
    public User findUserById(String userId) {
        if (userId == null) {
            return null;
        }

        UserNode current = head;

        while (current != null) {
            if (userId.equals(current.data.getUserId())) {
                return current.data;
            }
            current = current.next;
        }

        return null;
    }

    // Update by ID: O(n)
    public boolean updateUser(User updatedUser) {
        if (updatedUser == null || updatedUser.getUserId() == null) {
            return false;
        }

        UserNode current = head;

        while (current != null) {
            if (updatedUser.getUserId().equals(current.data.getUserId())) {
                current.data = updatedUser;
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

    // Clear the list by removing references to the first and last node: O(1)
    public void clear() {
        head = null;
        tail = null;
        size = 0;
    }
}
