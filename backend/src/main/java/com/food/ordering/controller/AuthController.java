package com.food.ordering.controller;

import com.food.ordering.config.JwtUtils;
import com.food.ordering.dto.AuthResponse;
import com.food.ordering.dto.LoginRequest;
import com.food.ordering.dto.RegisterRequest;
import com.food.ordering.entity.Role;
import com.food.ordering.entity.User;
import com.food.ordering.repository.UserRepository;
import com.food.ordering.repository.RestaurantRepository;
import com.food.ordering.entity.Restaurant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        Restaurant restaurant = null;
        if (signUpRequest.getRestaurantId() != null) {
            restaurant = restaurantRepository.findById(signUpRequest.getRestaurantId()).orElse(null);
        } else if (signUpRequest.getNewRestaurantName() != null && !signUpRequest.getNewRestaurantName().trim().isEmpty()) {
            restaurant = Restaurant.builder()
                    .name(signUpRequest.getNewRestaurantName())
                    .address(signUpRequest.getNewRestaurantAddress() != null ? signUpRequest.getNewRestaurantAddress() : "")
                    .description(signUpRequest.getNewRestaurantDescription() != null ? signUpRequest.getNewRestaurantDescription() : "")
                    .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500")
                    .build();
            restaurant = restaurantRepository.save(restaurant);
        }

        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.CUSTOMER)
                .restaurant(restaurant)
                .addresses(new ArrayList<>())
                .build();

        userRepository.save(user);

        String jwt = jwtUtils.generateJwtToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getRestaurant()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());

            User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

            return ResponseEntity.ok(new AuthResponse(
                    jwt,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getRestaurant()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Invalid email or password");
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
        }
        User user = userOpt.get();
        String jwt = jwtUtils.generateJwtToken(user.getEmail());
        AuthResponse resp = new AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getRestaurant()
        );
        resp.setAddresses(user.getAddresses());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/setup-restaurant")
    public ResponseEntity<?> setupRestaurant(@RequestBody RegisterRequest req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
        }
        User user = userOpt.get();
        if (user.getRestaurant() != null) {
            return ResponseEntity.badRequest().body("Error: You already have a restaurant linked.");
        }
        if (req.getNewRestaurantName() == null || req.getNewRestaurantName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Restaurant name is required.");
        }
        Restaurant restaurant = Restaurant.builder()
                .name(req.getNewRestaurantName().trim())
                .address(req.getNewRestaurantAddress() != null ? req.getNewRestaurantAddress().trim() : "")
                .description(req.getNewRestaurantDescription() != null ? req.getNewRestaurantDescription().trim() : "")
                .imageUrl("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500")
                .build();
        restaurant = restaurantRepository.save(restaurant);
        user.setRestaurant(restaurant);
        userRepository.save(user);
        String jwt = jwtUtils.generateJwtToken(user.getEmail());
        AuthResponse resp = new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getRestaurant());
        resp.setAddresses(user.getAddresses());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody String address, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
        }
        User user = userOpt.get();
        
        String cleanAddress = address.trim();
        if (cleanAddress.startsWith("\"") && cleanAddress.endsWith("\"")) {
            cleanAddress = cleanAddress.substring(1, cleanAddress.length() - 1);
        }

        user.getAddresses().add(cleanAddress);
        userRepository.save(user);
        return ResponseEntity.ok(user.getAddresses());
    }

    @DeleteMapping("/addresses")
    public ResponseEntity<?> removeAddress(@RequestParam String address, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
        }
        User user = userOpt.get();
        user.getAddresses().remove(address.trim());
        userRepository.save(user);
        return ResponseEntity.ok(user.getAddresses());
    }
}
