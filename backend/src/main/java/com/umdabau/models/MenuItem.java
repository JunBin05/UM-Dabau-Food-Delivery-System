package com.umdabau.models;

public class MenuItem {
    // 🚨 synchronized with API_CONTRACT.md
    private String itemId;
    private String restaurantId;
    private String name;
    private double price;
    private String category;

    public MenuItem() {
    }

    public MenuItem(String itemId, String restaurantId, String name, double price, String category) {
        this.itemId = itemId;
        this.restaurantId = restaurantId;
        this.name = name;
        this.price = price;
        this.category = category;
    }

    // Getters exactly matching JSON keys
    public String getItemId() { return itemId; }
    public String getRestaurantId() { return restaurantId; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getCategory() { return category; }

    public void setItemId(String itemId) { this.itemId = itemId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }
    public void setName(String name) { this.name = name; }
    public void setPrice(double price) { this.price = price; }
    public void setCategory(String category) { this.category = category; }

    @Override
    public String toString() {
        return name + " ($" + price + ") - " + category;
    }
}
