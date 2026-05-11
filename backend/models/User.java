package models;

public class User {
    String userId;          // primary key like "U-1001"
    String name;
    String role;            // "CUSTOMER", "RIDER", "ADMIN"
    String password;        // Keep it simple for the demo
    
    // Rider-Specific Variables
    boolean isAvailable;    // Is the rider currently free?
    String currentNodeId;   // Where is the rider right now? (e.g., "NODE_LIBRARY")
    String preferredZoneId; // Which node do they prefer delivering around?
}