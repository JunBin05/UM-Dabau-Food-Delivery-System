package com.umdabau.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * User record for customers, riders, and admins.
 * Rider availability and currentNodeId are used by dispatch and map tracking.
 */
@Entity
@Table(name = "users")
public class User {
    @Id
    private String userId;
    private String fullName;
    private String email;
    private String role;
    private String status;
    private boolean available;
    private String currentNodeId;

    public User() {
    }

    public User(String userId, String fullName, String email, String role, String status, boolean available, String currentNodeId) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.available = available;
        this.currentNodeId = currentNodeId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getCurrentNodeId() {
        return currentNodeId;
    }

    public void setCurrentNodeId(String currentNodeId) {
        this.currentNodeId = currentNodeId;
    }

    public String toString() {
        return "User ID: " + userId
                + ", Full Name: " + fullName
                + ", Email: " + email
                + ", Role: " + role
                + ", Status: " + status
                + ", Available: " + available
                + ", Current Node ID: " + currentNodeId;
    }
}
