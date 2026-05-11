package controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import models.MenuItem;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    // Vincent can immediately start fetching from localhost:8080/api/menu
    // Norman hasn't finished the BST yet, but Vincent doesn't care!
    @GetMapping
    public List<MenuItem> getMenu() {
        MenuItem dummyBurger = new MenuItem("M-01", "R-1", "Dabau Burger", 12.50, "Mains");
        MenuItem dummyFries = new MenuItem("M-02", "R-1", "FSKTM Fries", 5.00, "Sides");
        
        return Arrays.asList(dummyBurger, dummyFries);
    }
}