package com.umdabau.config;

import com.umdabau.data_structures.MenuBST;
import com.umdabau.models.MenuItem;

public class DummyDataLoader {

    // This static method acts as your central database loader
    public static MenuBST populateMenu() {
        MenuBST menuDatabase = new MenuBST();

        // REST-001: Campus Cafe
        menuDatabase.insert(new MenuItem("MENU-001", "REST-001", "Nasi Lemak Campus Set", 8.90, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-002", "REST-001", "Sweet Sour Chicken Rice", 10.90, "Chinese"));
        menuDatabase.insert(new MenuItem("MENU-003", "REST-001", "Iced Lemon Tea", 3.80, "Drinks"));

        // REST-002: KK12 Quick Bites
        menuDatabase.insert(new MenuItem("MENU-004", "REST-002", "Mee Goreng Mamak", 7.50, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-005", "REST-002", "Curry Puff Duo", 4.50, "Snacks"));
        menuDatabase.insert(new MenuItem("MENU-006", "REST-002", "Sirap Bandung", 3.50, "Drinks"));

        // REST-003: Central Eatery Malay Corner
        menuDatabase.insert(new MenuItem("MENU-007", "REST-003", "Ayam Masak Merah Rice", 9.80, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-008", "REST-003", "Rendang Beef Bowl", 12.90, "Malay"));

        // REST-004: Engineering Bites
        menuDatabase.insert(new MenuItem("MENU-009", "REST-004", "Hainanese Chicken Chop", 12.50, "Western"));
        menuDatabase.insert(new MenuItem("MENU-010", "REST-004", "Beef Burger Set", 13.90, "Western"));
        menuDatabase.insert(new MenuItem("MENU-011", "REST-004", "Loaded Fries Cup", 6.20, "Snacks"));

        // REST-005: Dabau Drinks Lab
        menuDatabase.insert(new MenuItem("MENU-012", "REST-005", "Iced Matcha Latte", 5.00, "Drinks"));
        menuDatabase.insert(new MenuItem("MENU-013", "REST-005", "Iced Latte", 6.90, "Drinks"));

        // REST-006: Library Greens
        menuDatabase.insert(new MenuItem("MENU-014", "REST-006", "Vegetarian Rice Bowl", 9.80, "Vegetarian"));
        menuDatabase.insert(new MenuItem("MENU-015", "REST-006", "Mushroom Wrap", 8.50, "Vegetarian"));

        return menuDatabase;
    }
}