package com.umdabau.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_items")
public class MenuItem {
    // 🚨 synchronized with API_CONTRACT.md
    @Id
    private String itemId;
    private String restaurantId;
    private String name;
    private double price;
    private String category;
    private String imageUrl;

    public MenuItem() {
    }

    public MenuItem(String itemId, String restaurantId, String name, double price, String category) {
        this.itemId = itemId;
        this.restaurantId = restaurantId;
        this.name = name;
        this.price = price;
        this.category = category;
    }

    public MenuItem(String itemId, String restaurantId, String name, double price, String category, String imageUrl) {
        this(itemId, restaurantId, name, price, category);
        this.imageUrl = imageUrl;
    }

    // Getters exactly matching JSON keys
    public String getItemId() { return itemId; }
    public String getRestaurantId() { return restaurantId; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }

    public void setItemId(String itemId) { this.itemId = itemId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }
    public void setName(String name) { this.name = name; }
    public void setPrice(double price) { this.price = price; }
    public void setCategory(String category) { this.category = category; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @Override
    public String toString() {
        return name + " ($" + price + ") - " + category;
    }
}
