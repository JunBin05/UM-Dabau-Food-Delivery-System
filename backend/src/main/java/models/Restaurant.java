package models;

public class Restaurant {
    private String restaurantId;
    private String restaurantName;
    private String category;
    private String status;
    private String campusLocation;
    private String nodeId;

    public Restaurant() {
    }

    public Restaurant(String restaurantId, String restaurantName, String category, String status, String campusLocation, String nodeId) {
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.category = category;
        this.status = status;
        this.campusLocation = campusLocation;
        this.nodeId = nodeId;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCampusLocation() {
        return campusLocation;
    }

    public void setCampusLocation(String campusLocation) {
        this.campusLocation = campusLocation;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String toString() {
        return "Restaurant ID: " + restaurantId
                + ", Restaurant Name: " + restaurantName
                + ", Category: " + category
                + ", Status: " + status
                + ", Campus Location: " + campusLocation
                + ", Node ID: " + nodeId;
    }
}
