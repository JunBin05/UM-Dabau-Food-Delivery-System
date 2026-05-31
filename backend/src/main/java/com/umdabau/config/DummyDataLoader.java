package com.umdabau.config;

import com.umdabau.data_structures.MenuBST;
import com.umdabau.models.MenuItem;

public class DummyDataLoader {

    // This static method acts as your central database loader
    public static MenuBST populateMenu() {
        MenuBST menuDatabase = new MenuBST();

        menuDatabase.insert(new MenuItem("MENU-001", "REST-001", "KK8 Nasi Lemak", 8.90, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-002", "REST-001", "Cafe KK8 Iced Tea", 3.80, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-003", "REST-002", "KK10 Chicken Rice", 8.50, "Chinese"));
        menuDatabase.insert(new MenuItem("MENU-004", "REST-002", "KK10 Mee Goreng", 7.50, "Malay"));

        menuDatabase.insert(new MenuItem("MENU-005", "REST-003", "Kafe Bahasa Fried Rice", 8.80, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-006", "REST-003", "Kafe Bahasa Curry Puff", 4.50, "Snacks"));

        menuDatabase.insert(new MenuItem("MENU-007", "REST-004", "Bayu Ayam Masak Merah Rice", 9.80, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-008", "REST-004", "Bayu Rendang Beef Bowl", 12.90, "Malay"));

        menuDatabase.insert(new MenuItem("MENU-009", "REST-005", "Kafe Sains Vegetarian Rice Bowl", 9.80, "Vegetarian"));
        menuDatabase.insert(new MenuItem("MENU-010", "REST-005", "Kafe Sains Mushroom Wrap", 8.50, "Vegetarian"));

        menuDatabase.insert(new MenuItem("MENU-011", "REST-006", "Yogo Yogurt Cup", 6.90, "Snacks"));
        menuDatabase.insert(new MenuItem("MENU-012", "REST-006", "Yogo Fruit Parfait", 8.90, "Snacks"));

        menuDatabase.insert(new MenuItem("MENU-013", "REST-007", "Foody Avenue Mee Goreng Mamak", 7.50, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-014", "REST-007", "Foody Avenue Sirap Bandung", 3.50, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-015", "REST-008", "Novi Kafe Chicken Chop", 12.50, "Western"));
        menuDatabase.insert(new MenuItem("MENU-016", "REST-008", "Novi Kafe Fries Cup", 6.20, "Snacks"));

        menuDatabase.insert(new MenuItem("MENU-017", "REST-009", "Warong Kaki Lima Nasi Campur", 9.50, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-018", "REST-009", "Warong Kaki Lima Teh Ais", 3.20, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-019", "REST-010", "Q Bistro Roti Canai", 2.80, "Mamak"));
        menuDatabase.insert(new MenuItem("MENU-020", "REST-010", "Q Bistro Maggi Goreng", 7.20, "Mamak"));

        menuDatabase.insert(new MenuItem("MENU-021", "REST-011", "ASTAR Cafe Economy Rice", 8.90, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-022", "REST-011", "ASTAR Cafe Fried Bee Hoon", 6.80, "Chinese"));

        menuDatabase.insert(new MenuItem("MENU-023", "REST-012", "Toast Kita Kaya Toast", 4.80, "Cafe"));
        menuDatabase.insert(new MenuItem("MENU-024", "REST-012", "Toast Kita Kopi", 3.90, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-025", "REST-013", "MediCafe Salad Bowl", 10.50, "Healthy"));
        menuDatabase.insert(new MenuItem("MENU-026", "REST-013", "MediCafe Chicken Wrap", 9.90, "Healthy"));

        menuDatabase.insert(new MenuItem("MENU-027", "REST-014", "Cafe KK2 Curry Laksa", 8.90, "Malay"));
        menuDatabase.insert(new MenuItem("MENU-028", "REST-014", "Cafe KK2 Lemon Tea", 3.80, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-029", "REST-015", "Engineering Chicken Rice", 8.50, "Chinese"));
        menuDatabase.insert(new MenuItem("MENU-030", "REST-015", "Crispy Chicken Chop Rice", 12.50, "Western"));

        menuDatabase.insert(new MenuItem("MENU-031", "REST-016", "KH Chicken Shawarma", 9.90, "Middle Eastern"));
        menuDatabase.insert(new MenuItem("MENU-032", "REST-016", "KH Shawarma Combo", 13.90, "Middle Eastern"));

        menuDatabase.insert(new MenuItem("MENU-033", "REST-017", "ZUS Iced Matcha Latte", 5.00, "Drinks"));
        menuDatabase.insert(new MenuItem("MENU-034", "REST-017", "ZUS Iced Latte", 6.90, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-035", "REST-018", "UM Central Sweet Sour Chicken Rice", 10.90, "Chinese"));
        menuDatabase.insert(new MenuItem("MENU-036", "REST-018", "UM Central Iced Lemon Tea", 3.80, "Drinks"));

        menuDatabase.insert(new MenuItem("MENU-037", "REST-019", "POKOK KL Big Breakfast", 16.90, "Cafe"));
        menuDatabase.insert(new MenuItem("MENU-038", "REST-019", "POKOK KL Latte", 8.90, "Drinks"));

        return menuDatabase;
    }
}
