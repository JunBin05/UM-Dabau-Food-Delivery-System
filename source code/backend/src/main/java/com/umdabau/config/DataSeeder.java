package com.umdabau.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.umdabau.models.MenuItem;
import com.umdabau.models.Restaurant;
import com.umdabau.models.User;
import com.umdabau.repository.MenuItemRepository;
import com.umdabau.repository.RestaurantRepository;
import com.umdabau.repository.UserRepository;

/**
 * Seeds the local H2 database with starter data for a fresh clone.
 * The local database file is ignored, so these records are what teammates receive on first run.
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    public DataSeeder(UserRepository userRepository, RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public void run(String... args) {
        // Each save method is idempotent: it updates the known ID instead of making duplicates.
        seedUsers();
        seedRestaurants();
        seedMenuItems();
    }

    private void seedUsers() {
        // These users cover the demo roles and give riders real graph node positions.
        saveUser("USR-001", "Aina Rahman", "aina.rahman@student.um.edu.my", "Customer", "Active", false, "NODE_KK12_BLOCK_A");
        saveUser("USR-002", "Rafiq Lim", "rafiq.lim@rider.umdabau.local", "Rider", "Active", true, "NODE_FSKTM");
        saveUser("USR-003", "Mei Yee", "mei.yee@rider.umdabau.local", "Rider", "Active", true, "NODE_LIBRARY");
        saveUser("USR-004", "Vincent Admin", "vincent.admin@umdabau.local", "Admin", "Active", false, "NODE_UM_CENTRAL");
    }

    private void seedRestaurants() {
        // Restaurant node IDs link the database records back to UMGraph route locations.
        saveRestaurant("REST-001", "Campus Cafe", "Malay & Chinese", "Open", "KK8", "NODE_CAFE_KK8", "/assets/restaurants/campus-cafe.jpg");
        saveRestaurant("REST-002", "KK12 Quick Bites", "Malay Snacks", "Open", "Kolej Kediaman 12", "NODE_FOODY_AVENUE_HESHE12", "/assets/restaurants/kk12-quick-bites.jpg");
        saveRestaurant("REST-003", "Central Eatery Malay Corner", "Malay", "Open", "Central Eatery", "NODE_UM_CENTRAL", "/assets/restaurants/central-eatery.jpg");
        saveRestaurant("REST-004", "Engineering Bites", "Western", "Open", "Engineering Quad", "NODE_BAYU_CAFE", "/assets/restaurants/engineering-bites.jpg");
        saveRestaurant("REST-005", "Dabau Drinks Lab", "Drinks", "Open", "Library Lobby", "NODE_LIBRARY", "/assets/restaurants/dabau-drinks-lab.jpg");
        saveRestaurant("REST-006", "Yogo @ Universiti Malaya", "Snacks", "Open", "IPS / KK12 Route", "NODE_YOGO", "/assets/restaurants/yogo.jpg");
        saveRestaurant("REST-007", "Foody Avenue & He & She Coffee", "Malay Snacks", "Open", "KK12 Food Court", "NODE_FOODY_AVENUE_HESHE12", "/assets/restaurants/foody-avenue.jpg");
        saveRestaurant("REST-008", "Novi Kafe", "Cafe", "Open", "KK12", "NODE_NOVI_KAFE", "/assets/restaurants/novi-kafe.jpg");
        saveRestaurant("REST-009", "Warong Kaki Lima", "Malay", "Open", "KK5", "NODE_WARONG_LIMA", "/assets/restaurants/warong-kaki-lima.jpg");
        saveRestaurant("REST-010", "Q Bistro Universiti Malaya", "Mamak", "Open", "KL Gate", "NODE_Q_BISTRO", "/assets/restaurants/q-bistro.jpg");
        saveRestaurant("REST-011", "ASTAR Cafe", "Malay", "Open", "First College", "NODE_ASTAR_CAFE", "/assets/restaurants/astar-cafe.jpg");
        saveRestaurant("REST-012", "Toast Kita Cafe", "Cafe", "Open", "KK6", "NODE_TOAST_KITA", "/assets/restaurants/toast-kita.jpg");
        saveRestaurant("REST-013", "MediCafe", "Healthy", "Open", "Faculty of Medicine", "NODE_MEDI_CAFE", "/assets/restaurants/medicafe.jpg");
        saveRestaurant("REST-014", "Cafe KK2", "Cafe", "Open", "Tuanku Bahiyah Residential College", "NODE_CAFE_KK2", "/assets/restaurants/cafe-kk2.jpg");
        saveRestaurant("REST-015", "Engineering Fac Chicken Rice", "Chinese", "Open", "Engineering", "NODE_ENG_CHICKEN_RICE", "/assets/restaurants/engineering-chicken-rice.jpg");
        saveRestaurant("REST-016", "KH Shawarma", "Middle Eastern", "Open", "Engineering", "NODE_KH_SHAWARMA", "/assets/restaurants/kh-shawarma.jpg");
        saveRestaurant("REST-017", "ZUS Coffee", "Drinks", "Open", "UM Central Library", "NODE_ZUS", "/assets/restaurants/zus-coffee.jpg");
        saveRestaurant("REST-018", "UM Central & He & She Coffee", "Cafe", "Open", "UM Central", "NODE_UM_CENTRAL", "/assets/restaurants/um-central-cafe.jpg");
        saveRestaurant("REST-019", "POKOK KL Cafe", "Cafe", "Open", "Faculty of Business & Economics", "NODE_POKOK_CAFE", "/assets/restaurants/pokok-cafe.jpg");
    }

    private void seedMenuItems() {
        // Menu IDs are stable so the cart can persist items by itemId.
        saveMenuItem("MENU-001", "REST-001", "KK8 Nasi Lemak", 8.90, "Malay", "/assets/food/nasi-lemak.jpg");
        saveMenuItem("MENU-002", "REST-001", "Cafe KK8 Iced Tea", 3.80, "Drinks", "/assets/food/iced-tea.jpg");
        saveMenuItem("MENU-003", "REST-002", "KK12 Chicken Rice", 8.50, "Chinese", "/assets/food/chicken-rice.jpg");
        saveMenuItem("MENU-004", "REST-002", "KK12 Mee Goreng", 7.50, "Malay", "/assets/food/mee-goreng.jpg");
        saveMenuItem("MENU-005", "REST-003", "Kafe Bahasa Fried Rice", 8.80, "Malay", "/assets/food/fried-rice.jpg");
        saveMenuItem("MENU-006", "REST-003", "Kafe Bahasa Curry Puff", 4.50, "Snacks", "/assets/food/curry-puff.jpg");
        saveMenuItem("MENU-007", "REST-004", "Engineering Chicken Chop Rice", 12.50, "Western", "/assets/food/chicken-chop.jpg");
        saveMenuItem("MENU-008", "REST-004", "Engineering Fries Cup", 6.20, "Snacks", "/assets/food/fries.jpg");
        saveMenuItem("MENU-009", "REST-005", "Dabau Smoothie Bowl", 9.80, "Vegetarian", "/assets/food/smoothie-bowl.jpg");
        saveMenuItem("MENU-010", "REST-005", "Dabau Iced Lemon Tea", 3.80, "Drinks", "/assets/food/iced-tea.jpg");
        saveMenuItem("MENU-011", "REST-006", "Yogo Yogurt Cup", 6.90, "Snacks", "/assets/food/yogurt.jpg");
        saveMenuItem("MENU-012", "REST-006", "Yogo Fruit Parfait", 8.90, "Snacks", "/assets/food/parfait.jpg");
        saveMenuItem("MENU-013", "REST-007", "Foody Avenue Mee Goreng Mamak", 7.50, "Malay", "/assets/food/mee-goreng.jpg");
        saveMenuItem("MENU-014", "REST-007", "Foody Avenue Sirap Bandung", 3.50, "Drinks", "/assets/food/sirap-bandung.jpg");
        saveMenuItem("MENU-015", "REST-008", "Novi Kafe Chicken Chop", 12.50, "Western", "/assets/food/chicken-chop.jpg");
        saveMenuItem("MENU-016", "REST-008", "Novi Kafe Fries Cup", 6.20, "Snacks", "/assets/food/fries.jpg");
        saveMenuItem("MENU-017", "REST-009", "Warong Kaki Lima Nasi Campur", 9.50, "Malay", "/assets/food/nasi-campur.jpg");
        saveMenuItem("MENU-018", "REST-009", "Warong Kaki Lima Teh Ais", 3.20, "Drinks", "/assets/food/iced-tea.jpg");
        saveMenuItem("MENU-019", "REST-010", "Q Bistro Roti Canai", 2.80, "Mamak", "/assets/food/roti-canai.jpg");
        saveMenuItem("MENU-020", "REST-010", "Q Bistro Maggi Goreng", 7.20, "Mamak", "/assets/food/mee-goreng.jpg");
        saveMenuItem("MENU-021", "REST-011", "ASTAR Cafe Economy Rice", 8.90, "Malay", "/assets/food/economy-rice.jpg");
        saveMenuItem("MENU-022", "REST-011", "ASTAR Cafe Fried Bee Hoon", 6.80, "Chinese", "/assets/food/fried-bee-hoon.jpg");
        saveMenuItem("MENU-023", "REST-012", "Toast Kita Kaya Toast", 4.80, "Cafe", "/assets/food/kaya-toast.jpg");
        saveMenuItem("MENU-024", "REST-012", "Toast Kita Kopi", 3.90, "Drinks", "/assets/food/coffee.jpg");
        saveMenuItem("MENU-025", "REST-013", "MediCafe Salad Bowl", 10.50, "Healthy", "/assets/food/salad-bowl.jpg");
        saveMenuItem("MENU-026", "REST-013", "MediCafe Chicken Wrap", 9.90, "Healthy", "/assets/food/chicken-wrap.jpg");
        saveMenuItem("MENU-027", "REST-014", "Cafe KK2 Curry Laksa", 8.90, "Malay", "/assets/food/curry-laksa.jpg");
        saveMenuItem("MENU-028", "REST-014", "Cafe KK2 Lemon Tea", 3.80, "Drinks", "/assets/food/iced-tea.jpg");
        saveMenuItem("MENU-029", "REST-015", "Engineering Chicken Rice", 8.50, "Chinese", "/assets/food/chicken-rice.jpg");
        saveMenuItem("MENU-030", "REST-015", "Crispy Chicken Chop Rice", 12.50, "Western", "/assets/food/chicken-chop.jpg");
        saveMenuItem("MENU-031", "REST-016", "KH Chicken Shawarma", 9.90, "Middle Eastern", "/assets/food/shawarma.jpg");
        saveMenuItem("MENU-032", "REST-016", "KH Shawarma Combo", 13.90, "Middle Eastern", "/assets/food/shawarma-combo.jpg");
        saveMenuItem("MENU-033", "REST-017", "ZUS Iced Matcha Latte", 5.00, "Drinks", "/assets/food/matcha-latte.jpg");
        saveMenuItem("MENU-034", "REST-017", "ZUS Iced Latte", 6.90, "Drinks", "/assets/food/coffee.jpg");
        saveMenuItem("MENU-035", "REST-018", "UM Central Sweet Sour Chicken Rice", 10.90, "Chinese", "/assets/food/sweet-sour-chicken.jpg");
        saveMenuItem("MENU-036", "REST-018", "UM Central Iced Lemon Tea", 3.80, "Drinks", "/assets/food/iced-tea.jpg");
        saveMenuItem("MENU-037", "REST-019", "POKOK KL Big Breakfast", 16.90, "Cafe", "/assets/food/big-breakfast.jpg");
        saveMenuItem("MENU-038", "REST-019", "POKOK KL Latte", 8.90, "Drinks", "/assets/food/coffee.jpg");
    }

    private void saveUser(String userId, String fullName, String email, String role, String status, boolean available, String currentNodeId) {
        User user = userRepository.findById(userId).orElseGet(User::new);
        user.setUserId(userId);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setRole(role);
        user.setStatus(status);
        user.setAvailable(available);
        user.setCurrentNodeId(currentNodeId);
        userRepository.save(user);
    }

    private void saveRestaurant(String restaurantId, String restaurantName, String category, String status, String campusLocation, String nodeId, String imageUrl) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseGet(Restaurant::new);
        restaurant.setRestaurantId(restaurantId);
        restaurant.setRestaurantName(restaurantName);
        restaurant.setCategory(category);
        restaurant.setStatus(status);
        restaurant.setCampusLocation(campusLocation);
        restaurant.setNodeId(nodeId);
        restaurant.setImageUrl(imageUrl);
        restaurantRepository.save(restaurant);
    }

    private void saveMenuItem(String itemId, String restaurantId, String name, double price, String category, String imageUrl) {
        MenuItem menuItem = menuItemRepository.findById(itemId).orElseGet(MenuItem::new);
        menuItem.setItemId(itemId);
        menuItem.setRestaurantId(restaurantId);
        menuItem.setName(name);
        menuItem.setPrice(price);
        menuItem.setCategory(category);
        menuItem.setImageUrl(imageUrl);
        menuItemRepository.save(menuItem);
    }
}
