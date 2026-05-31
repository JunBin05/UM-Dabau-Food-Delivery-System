package com.umdabau.models;

public class MenuItem {
    // 🚨 synchronized with API_CONTRACT.md
    private String itemId;
    private String restaurantId;
    private String name;
    private double price;
    private String category;

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

    @Override
    public String toString() {
        return name + " ($" + price + ") - " + category;
    }
}
