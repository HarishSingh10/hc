package com.food.ordering.controller;

import com.food.ordering.dto.MenuItemRequest;
import com.food.ordering.entity.MenuItem;
import com.food.ordering.entity.Restaurant;
import com.food.ordering.entity.User;
import com.food.ordering.entity.Role;
import com.food.ordering.repository.MenuItemRepository;
import com.food.ordering.repository.RestaurantRepository;
import com.food.ordering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<MenuItem> getAllMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        String normCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) 
                ? category.trim() : null;
        String normSearch = (search != null && !search.trim().isEmpty()) 
                ? search.trim() : null;

        return menuItemRepository.findByCategoryAndSearch(normCategory, normSearch);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuItem> getMenuItemsByRestaurant(@PathVariable Long restaurantId, @RequestParam(required = false) String category) {
        if (category != null && !category.trim().isEmpty()) {
            return menuItemRepository.findByRestaurantIdAndCategoryIgnoreCase(restaurantId, category.trim());
        }
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    @PostMapping
    public ResponseEntity<?> createMenuItem(Principal principal, @RequestBody MenuItemRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Error: Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Error: User not found");
        }

        if (user.getRole() == Role.SHOP_OWNER) {
            if (user.getRestaurant() == null || !user.getRestaurant().getId().equals(request.getRestaurantId())) {
                return ResponseEntity.status(403).body("Error: Forbidden - You do not own this restaurant");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Error: Forbidden - Only Admin or Shop Owner allowed");
        }

        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(request.getRestaurantId());
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Restaurant not found");
        }

        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .available(request.isAvailable())
                .restaurant(restaurantOpt.get())
                .build();

        try {
            MenuItem savedItem = menuItemRepository.save(menuItem);
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving menu item: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(Principal principal, @PathVariable Long id, @RequestBody MenuItemRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Error: Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Error: User not found");
        }

        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(id);
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MenuItem menuItem = menuItemOpt.get();

        if (user.getRole() == Role.SHOP_OWNER) {
            if (user.getRestaurant() == null || !user.getRestaurant().getId().equals(menuItem.getRestaurant().getId())) {
                return ResponseEntity.status(403).body("Error: Forbidden - You do not own this restaurant");
            }
            if (request.getRestaurantId() != null && !user.getRestaurant().getId().equals(request.getRestaurantId())) {
                return ResponseEntity.status(403).body("Error: Forbidden - You cannot reassign this menu item to another restaurant");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Error: Forbidden - Only Admin or Shop Owner allowed");
        }

        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setCategory(request.getCategory());
        menuItem.setAvailable(request.isAvailable());

        if (request.getRestaurantId() != null) {
            Optional<Restaurant> restaurantOpt = restaurantRepository.findById(request.getRestaurantId());
            if (restaurantOpt.isPresent()) {
                menuItem.setRestaurant(restaurantOpt.get());
            }
        }

        MenuItem updatedItem = menuItemRepository.save(menuItem);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(Principal principal, @PathVariable Long id) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Error: Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("Error: User not found");
        }

        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(id);
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MenuItem menuItem = menuItemOpt.get();

        if (user.getRole() == Role.SHOP_OWNER) {
            if (user.getRestaurant() == null || !user.getRestaurant().getId().equals(menuItem.getRestaurant().getId())) {
                return ResponseEntity.status(403).body("Error: Forbidden - You do not own this restaurant");
            }
        } else if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("Error: Forbidden - Only Admin or Shop Owner allowed");
        }

        menuItemRepository.delete(menuItem);
        return ResponseEntity.ok("Menu item deleted successfully");
    }
}
