package com.umdabau.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.config.DummyDataLoader; // Imports your new data file
import com.umdabau.data_structures.MenuBST;
import com.umdabau.models.MenuItem;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MenuController {

    // 1. Fetch the data from the loader file exactly once when the server starts
    private MenuBST menuDatabase = DummyDataLoader.populateMenu();

    public MenuController() {
        // Look how clean this is! No data logic mixed in with networking logic.
    }

    // 2. The endpoint that Vincent's React app calls
    @GetMapping("/menu")
    public List<MenuItem> getFullMenu() {
        // Extracts the list from the AVL tree and sends it as JSON
        return menuDatabase.inOrderTraversal(); 
    }
}