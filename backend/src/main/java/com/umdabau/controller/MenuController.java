package com.umdabau.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.umdabau.data_structures.MenuBST;
import com.umdabau.models.MenuItem;
import com.umdabau.repository.MenuItemRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"})
/**
 * Menu API reads menu records from H2, then hydrates MenuBST before returning results.
 */
public class MenuController {
    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping("/menu")
    public List<MenuItem> getFullMenu() {
        // Return the tree traversal so Browse Menu receives items in BST order.
        return buildMenuDatabase().inOrderTraversal();
    }

    @GetMapping("/menu/search")
    public List<MenuItem> searchMenuByName(@RequestParam(name = "name", required = false) String name) {
        String searchName = name == null ? "" : name.trim();
        if (searchName.isEmpty()) {
            return List.of();
        }

        MenuBST menuDatabase = buildMenuDatabase();
        // Use the assignment's BST search first for exact name lookup.
        MenuItem exactMatch = menuDatabase.searchByName(searchName);
        if (exactMatch != null) {
            return List.of(exactMatch);
        }

        String normalizedSearch = searchName.toLowerCase();
        // User search is usually partial, so keep a simple contains fallback after BST exact search.
        return menuDatabase.inOrderTraversal().stream()
                .filter(item -> item.getName() != null && item.getName().toLowerCase().contains(normalizedSearch))
                .toList();
    }

    private MenuBST buildMenuDatabase() {
        MenuBST menuDatabase = new MenuBST();
        // Database is storage; MenuBST is still the structure used for menu ordering/search.
        for (MenuItem item : menuItemRepository.findAll()) {
            menuDatabase.insert(item);
        }
        return menuDatabase;
    }
}
