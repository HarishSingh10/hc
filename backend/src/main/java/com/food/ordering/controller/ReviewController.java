package com.food.ordering.controller;

import com.food.ordering.dto.ReviewRequest;
import com.food.ordering.entity.Restaurant;
import com.food.ordering.entity.Review;
import com.food.ordering.entity.User;
import com.food.ordering.repository.RestaurantRepository;
import com.food.ordering.repository.ReviewRepository;
import com.food.ordering.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getReviewsByRestaurant(@PathVariable Long restaurantId) {
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Restaurant not found");
        }
        List<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<?> addReview(@PathVariable Long restaurantId, @RequestBody ReviewRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Unauthorized");
        }
        Optional<User> userOpt = userRepository.findByEmail(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: User not found");
        }
        Optional<Restaurant> restaurantOpt = restaurantRepository.findById(restaurantId);
        if (restaurantOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Restaurant not found");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            return ResponseEntity.badRequest().body("Error: Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .user(userOpt.get())
                .restaurant(restaurantOpt.get())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);
        // Clean password from user response data
        savedReview.getUser().setPassword("");

        return ResponseEntity.ok(savedReview);
    }
}
