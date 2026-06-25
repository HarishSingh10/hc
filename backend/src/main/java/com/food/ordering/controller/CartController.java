package com.food.ordering.controller;

import com.food.ordering.dto.CartItemRequest;
import com.food.ordering.entity.CartItem;
import com.food.ordering.entity.MenuItem;
import com.food.ordering.entity.User;
import com.food.ordering.repository.CartItemRepository;
import com.food.ordering.repository.MenuItemRepository;
import com.food.ordering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@Transactional
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) return null;
        return userRepository.findByEmail(principal.getName()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getCart(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartItemRequest request, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(request.getMenuItemId());
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Menu item not found");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndMenuItemId(user.getId(), request.getMenuItemId());

        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .menuItem(menuItemOpt.get())
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return ResponseEntity.ok(savedItem);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody CartItemRequest request, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndMenuItemId(user.getId(), request.getMenuItemId());
        if (existingItemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Item not found in cart");
        }

        CartItem cartItem = existingItemOpt.get();
        if (request.getQuantity() <= 0) {
            cartItemRepository.delete(cartItem);
            return ResponseEntity.ok("Item removed from cart");
        } else {
            cartItem.setQuantity(request.getQuantity());
            CartItem savedItem = cartItemRepository.save(cartItem);
            return ResponseEntity.ok(savedItem);
        }
    }

    @DeleteMapping("/remove/{menuItemId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long menuItemId, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndMenuItemId(user.getId(), menuItemId);
        if (existingItemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Item not found in cart");
        }

        cartItemRepository.delete(existingItemOpt.get());
        return ResponseEntity.ok("Item removed from cart");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }

        cartItemRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok("Cart cleared successfully");
    }
}
