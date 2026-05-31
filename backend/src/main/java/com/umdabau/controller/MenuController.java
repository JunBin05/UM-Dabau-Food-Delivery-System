package com.umdabau.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.data_structures.MenuBST;
import com.umdabau.models.MenuItem;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MenuController {

    // 1. Create your Data Structure here (or in a Service layer)
    private MenuBST menuDatabase = new MenuBST();

    public MenuController() {
        // You might populate dummy data here on startup
        menuDatabase.insert(new MenuItem("M-01", "R-500", "Ayam Goreng", 12.50, "Mains"));
        menuDatabase.insert(new MenuItem("M-02", "R-500", "Teh Tarik", 3.00, "Drinks"));
    }

    // 2. THIS is the exact endpoint Vincent is fetching!
    @GetMapping("/menu")
    public List<MenuItem> getFullMenu() {
        // You tell the BST to return its data as an array, and Spring Boot converts it to JSON automatically!
        return menuDatabase.inOrderTraversal(); 
    }
}