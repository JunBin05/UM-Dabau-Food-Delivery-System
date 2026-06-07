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
public class MenuController {
    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @GetMapping("/menu")
    public List<MenuItem> getFullMenu() {
        return buildMenuDatabase().inOrderTraversal();
    }

    @GetMapping("/menu/search")
    public List<MenuItem> searchMenuByName(@RequestParam(name = "name", required = false) String name) {
        String searchName = name == null ? "" : name.trim();
        if (searchName.isEmpty()) {
            return List.of();
        }

        MenuBST menuDatabase = buildMenuDatabase();
        MenuItem exactMatch = menuDatabase.searchByName(searchName);
        if (exactMatch != null) {
            return List.of(exactMatch);
        }

        String normalizedSearch = searchName.toLowerCase();
        return menuDatabase.inOrderTraversal().stream()
                .filter(item -> item.getName() != null && item.getName().toLowerCase().contains(normalizedSearch))
                .toList();
    }

    private MenuBST buildMenuDatabase() {
        MenuBST menuDatabase = new MenuBST();
        for (MenuItem item : menuItemRepository.findAll()) {
            menuDatabase.insert(item);
        }
        return menuDatabase;
    }
}
